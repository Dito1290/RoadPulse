"""
MobileNetV2 Training Script for RoadPulse
Trains on 4 classes: Crack, Normal, Pothole, Surface Erosion

Usage (dari folder backend/):
  venv311/bin/python ai_model/train.py                        # latih -> ai_model/mobilenetv2_road_damage.candidate.pt
  venv311/bin/python ai_model/train.py --eval ai_model/mobilenetv2_road_damage.pt   # evaluasi model mana pun

Model baru disimpan sebagai *kandidat* dan TIDAK menimpa model yang dipakai server.
Bandingkan hasil --eval, lalu salin kandidat ke mobilenetv2_road_damage.pt bila lebih baik.

Perbaikan dibanding versi awal (fokus recall kelas Pothole):
  - Augmentasi lebih kuat: RandomResizedCrop, perspektif, blur, kecerahan/kontras lebar (meniru jalan basah,
    bayangan, malam), RandomErasing.
  - Bobot kelas (inverse frequency) + label smoothing pada loss.
  - Fine-tuning seluruh layer lebih lama dengan AdamW + cosine LR.
  - Checkpoint terbaik dipilih dari balanced accuracy (rata-rata recall per kelas), bukan akurasi total,
    agar kelas yang lemah tidak dikorbankan.
  - Split validasi sama dengan versi awal (80/20, seed 42) sehingga hasilnya dapat dibandingkan langsung.
"""
import argparse
import json
import sys
import time
from collections import Counter
from pathlib import Path

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Subset, random_split
from torchvision import datasets, models, transforms

# ── Path setup ────────────────────────────────────────────────
BASE_DIR    = Path(__file__).resolve().parent           # backend/ai_model/
BACKEND_DIR = BASE_DIR.parent                           # backend/
PROJECT_DIR = BACKEND_DIR.parent                        # RoadPulse/
DATASET_DIR = PROJECT_DIR / "dataset"
LIVE_PATH   = BASE_DIR / "mobilenetv2_road_damage.pt"
CANDIDATE   = BASE_DIR / "mobilenetv2_road_damage.candidate.pt"

# ── Hyperparameters ───────────────────────────────────────────
BATCH_SIZE  = 32
IMG_SIZE    = 224
NUM_CLASSES = 4
MEAN, STD   = [0.485, 0.456, 0.406], [0.229, 0.224, 0.225]
SEED        = 42


def get_transforms():
    train_tf = transforms.Compose([
        transforms.RandomResizedCrop(IMG_SIZE, scale=(0.55, 1.0), ratio=(0.75, 1.33)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(p=0.2),
        transforms.RandomApply([transforms.RandomPerspective(distortion_scale=0.3, p=1.0)], p=0.3),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.45, contrast=0.4, saturation=0.3, hue=0.03),
        transforms.RandomGrayscale(p=0.05),
        transforms.RandomApply([transforms.GaussianBlur(5, sigma=(0.1, 1.8))], p=0.2),
        transforms.ToTensor(),
        transforms.Normalize(MEAN, STD),
        transforms.RandomErasing(p=0.2, scale=(0.02, 0.12)),
    ])
    val_tf = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(MEAN, STD),
    ])
    return train_tf, val_tf


def build_model(pretrained=True):
    if pretrained:
        try:
            model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
        except Exception:
            model = models.mobilenet_v2(pretrained=True)
    else:
        model = models.mobilenet_v2(weights=None)
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(model.last_channel, NUM_CLASSES),
    )
    return model


def get_device():
    if torch.backends.mps.is_available():
        return torch.device("mps")
    if torch.cuda.is_available():
        return torch.device("cuda")
    return torch.device("cpu")


def make_splits():
    """Split 80/20 identik dengan versi awal (seed 42) — validasi tetap 377 gambar yang sama."""
    if not DATASET_DIR.exists():
        print(f"[ERROR] Dataset tidak ditemukan: {DATASET_DIR}")
        sys.exit(1)
    train_tf, val_tf = get_transforms()
    base = datasets.ImageFolder(str(DATASET_DIR))
    n_train = int(0.8 * len(base))
    tr, vl = random_split(range(len(base)), [n_train, len(base) - n_train],
                          generator=torch.Generator().manual_seed(SEED))
    train_ds = Subset(datasets.ImageFolder(str(DATASET_DIR), transform=train_tf), list(tr))
    val_ds = Subset(datasets.ImageFolder(str(DATASET_DIR), transform=val_tf), list(vl))
    return base.classes, base.targets, train_ds, val_ds


def evaluate(model, loader, device, classes):
    """Akurasi, recall per kelas, balanced accuracy, dan confusion matrix (baris = label asli)."""
    model.eval()
    k = len(classes)
    cm = [[0] * k for _ in range(k)]
    with torch.no_grad():
        for imgs, labels in loader:
            preds = model(imgs.to(device)).argmax(1).cpu()
            for t, p in zip(labels.tolist(), preds.tolist()):
                cm[t][p] += 1
    total = sum(map(sum, cm))
    correct = sum(cm[i][i] for i in range(k))
    recall = {classes[i]: cm[i][i] / max(1, sum(cm[i])) for i in range(k)}
    precision = {classes[j]: cm[j][j] / max(1, sum(cm[i][j] for i in range(k))) for j in range(k)}
    return {
        'accuracy': correct / total,
        'balanced_accuracy': sum(recall.values()) / k,
        'recall': recall,
        'precision': precision,
        'confusion_matrix': cm,
        'classes': classes,
        'n_val': total,
    }


def print_report(title, m):
    print(f"\n{title}")
    print(f"  Akurasi          : {m['accuracy'] * 100:.1f}%  ({m['n_val']} gambar validasi)")
    print(f"  Balanced accuracy: {m['balanced_accuracy'] * 100:.1f}%")
    for c in m['classes']:
        print(f"  {c:<16} recall {m['recall'][c] * 100:5.1f}%   precision {m['precision'][c] * 100:5.1f}%")
    print("  Confusion matrix (baris = asli, kolom = prediksi):", m['classes'])
    for c, row in zip(m['classes'], m['confusion_matrix']):
        print(f"    {c:<16} {row}")


def load_checkpoint(path, device):
    ckpt = torch.load(path, map_location=device, weights_only=False)
    model = build_model(pretrained=False)
    model.load_state_dict(ckpt['model_state_dict'])
    return model.to(device), ckpt


def run_epoch(model, loader, criterion, optimizer, device, scheduler=None):
    model.train()
    run_loss, correct, total = 0.0, 0, 0
    for imgs, labels in loader:
        imgs, labels = imgs.to(device), labels.to(device)
        optimizer.zero_grad()
        out = model(imgs)
        loss = criterion(out, labels)
        loss.backward()
        optimizer.step()
        if scheduler:
            scheduler.step()
        run_loss += loss.item() * imgs.size(0)
        correct += (out.argmax(1) == labels).sum().item()
        total += labels.size(0)
    return run_loss / total, correct / total


def train(args):
    torch.manual_seed(SEED)
    device = get_device()
    classes, targets, train_ds, val_ds = make_splits()
    print(f"Device: {device} | Kelas: {classes} | Train {len(train_ds)} | Val {len(val_ds)}")

    # Bobot kelas dari distribusi data latih (kelas sedikit -> bobot lebih besar)
    counts = Counter(targets[i] for i in train_ds.indices)
    weights = torch.tensor([len(train_ds) / (NUM_CLASSES * counts[i]) for i in range(NUM_CLASSES)], dtype=torch.float)
    print("Jumlah latih per kelas:", {classes[i]: counts[i] for i in range(NUM_CLASSES)})
    print("Bobot loss           :", {classes[i]: round(w, 2) for i, w in enumerate(weights.tolist())})
    criterion = nn.CrossEntropyLoss(weight=weights.to(device), label_smoothing=0.05)

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True, num_workers=args.workers,
                              persistent_workers=args.workers > 0)
    val_loader = DataLoader(val_ds, batch_size=64, shuffle=False, num_workers=args.workers,
                            persistent_workers=args.workers > 0)

    model = build_model().to(device)
    best = {'balanced_accuracy': -1}

    def maybe_save(tag):
        nonlocal best
        m = evaluate(model, val_loader, device, classes)
        better = (m['balanced_accuracy'], m['accuracy']) > (best['balanced_accuracy'], best.get('accuracy', 0))
        print(f"  {tag}  Val acc {m['accuracy'] * 100:.1f}%  bal {m['balanced_accuracy'] * 100:.1f}%  "
              f"Pothole {m['recall']['Pothole'] * 100:.1f}%" + ("  ← terbaik, disimpan" if better else ""), flush=True)
        if better:
            best = m
            torch.save({'model_state_dict': model.state_dict(), 'classes': classes,
                        'val_acc': m['accuracy'], 'metrics': m}, args.out)

    # Fase 1: hanya classifier head (feature extractor beku)
    for p in model.features.parameters():
        p.requires_grad = False
    opt = optim.AdamW(model.classifier.parameters(), lr=1e-3, weight_decay=1e-4)
    for ep in range(args.head_epochs):
        t0 = time.time()
        loss, acc = run_epoch(model, train_loader, criterion, opt, device)
        print(f"Head {ep + 1}/{args.head_epochs} [{time.time() - t0:.0f}s] train acc {acc * 100:.1f}% loss {loss:.3f}", flush=True)
        maybe_save(f"head{ep + 1}")

    # Fase 2: fine-tune seluruh layer, cosine LR
    for p in model.features.parameters():
        p.requires_grad = True
    opt = optim.AdamW([
        {'params': model.features.parameters(), 'lr': 2e-4},
        {'params': model.classifier.parameters(), 'lr': 5e-4},
    ], weight_decay=1e-4)
    sched = optim.lr_scheduler.OneCycleLR(opt, max_lr=[2e-4, 5e-4], total_steps=args.ft_epochs * len(train_loader),
                                          pct_start=0.15)
    for ep in range(args.ft_epochs):
        t0 = time.time()
        loss, acc = run_epoch(model, train_loader, criterion, opt, device, sched)
        print(f"FT {ep + 1}/{args.ft_epochs} [{time.time() - t0:.0f}s] train acc {acc * 100:.1f}% loss {loss:.3f}", flush=True)
        maybe_save(f"ft{ep + 1}")

    print_report(f"Model terbaik disimpan di {args.out}", best)
    Path(args.out).with_suffix('.metrics.json').write_text(json.dumps(best, indent=2))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--eval', metavar='CHECKPOINT', help='hanya evaluasi checkpoint pada split validasi')
    ap.add_argument('--out', default=str(CANDIDATE), help='lokasi simpan model hasil latih')
    ap.add_argument('--head-epochs', type=int, default=4)
    ap.add_argument('--ft-epochs', type=int, default=10)
    ap.add_argument('--workers', type=int, default=2)
    args = ap.parse_args()

    if args.eval:
        device = get_device()
        classes, _, _, val_ds = make_splits()
        model, _ = load_checkpoint(args.eval, device)
        m = evaluate(model, DataLoader(val_ds, batch_size=64, num_workers=args.workers), device, classes)
        print_report(f"Evaluasi {args.eval}", m)
        return
    train(args)


if __name__ == "__main__":
    main()
