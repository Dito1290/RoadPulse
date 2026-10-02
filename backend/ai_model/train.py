"""
MobileNetV2 Training Script for RoadPulse
Trains on 4 classes: Crack, Normal, Pothole, Surface Erosion
Saves best model as mobilenetv2_road_damage.pt

Usage (dari folder backend/):
  source venv311/bin/activate
  python ai_model/train.py
"""
import os
import sys
import time
from pathlib import Path

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, transforms, models

# ── Path setup ────────────────────────────────────────────────
BASE_DIR    = Path(__file__).resolve().parent           # backend/ai_model/
BACKEND_DIR = BASE_DIR.parent                           # backend/
PROJECT_DIR = BACKEND_DIR.parent                        # RoadPulse/
DATASET_DIR = PROJECT_DIR / "dataset"
SAVE_PATH   = BASE_DIR / "mobilenetv2_road_damage.pt"

# ── Hyperparameters ───────────────────────────────────────────
BATCH_SIZE   = 32
NUM_EPOCHS   = 8
LR           = 1e-3
LR_FINETUNE  = 1e-4
IMG_SIZE     = 224
NUM_CLASSES  = 4


def get_transforms():
    train_tf = transforms.Compose([
        transforms.Resize((IMG_SIZE + 32, IMG_SIZE + 32)),
        transforms.RandomCrop(IMG_SIZE),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(p=0.2),
        transforms.RandomRotation(20),
        transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.2),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225]),
    ])
    val_tf = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225]),
    ])
    return train_tf, val_tf


def build_model():
    try:
        weights = models.MobileNet_V2_Weights.DEFAULT
        model = models.mobilenet_v2(weights=weights)
    except Exception:
        model = models.mobilenet_v2(pretrained=True)

    # Freeze feature extractor
    for param in model.features.parameters():
        param.requires_grad = False

    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, NUM_CLASSES),
    )
    return model


def evaluate(model, loader, criterion, device):
    model.eval()
    total_loss, correct, total = 0.0, 0, 0
    with torch.no_grad():
        for imgs, labels in loader:
            imgs, labels = imgs.to(device), labels.to(device)
            out  = model(imgs)
            loss = criterion(out, labels)
            total_loss += loss.item() * imgs.size(0)
            preds = out.argmax(dim=1)
            correct += (preds == labels).sum().item()
            total   += labels.size(0)
    return total_loss / total, correct / total


def train():
    print(f"\n{'='*55}")
    print(f"  RoadPulse – MobileNetV2 Training")
    print(f"  Dataset  : {DATASET_DIR}")
    print(f"  Save to  : {SAVE_PATH}")
    print(f"{'='*55}\n")

    if not DATASET_DIR.exists():
        print(f"[ERROR] Dataset tidak ditemukan: {DATASET_DIR}")
        print("Pastikan folder dataset/ ada di root RoadPulse/")
        sys.exit(1)

    # ── Device ────────────────────────────────────────────────
    if torch.backends.mps.is_available():
        device = torch.device("mps")
    elif torch.cuda.is_available():
        device = torch.device("cuda")
    else:
        device = torch.device("cpu")
    print(f"Device: {device}\n")

    # ── Dataset ───────────────────────────────────────────────
    train_tf, val_tf = get_transforms()
    full_ds = datasets.ImageFolder(str(DATASET_DIR), transform=train_tf)
    classes = full_ds.classes
    print(f"Kelas ditemukan  : {classes}")
    print(f"Total gambar     : {len(full_ds)}")

    train_n = int(0.8 * len(full_ds))
    val_n   = len(full_ds) - train_n
    train_ds, val_ds = random_split(full_ds, [train_n, val_n],
                                    generator=torch.Generator().manual_seed(42))

    # Apply val transform to val split
    val_ds.dataset = datasets.ImageFolder(str(DATASET_DIR), transform=val_tf)

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True,  num_workers=0, pin_memory=False)
    val_loader   = DataLoader(val_ds,   batch_size=BATCH_SIZE, shuffle=False, num_workers=0, pin_memory=False)
    print(f"Train: {train_n} | Val: {val_n}\n")

    # ── Model ─────────────────────────────────────────────────
    model     = build_model().to(device)
    criterion = nn.CrossEntropyLoss()

    # Phase 1: train hanya classifier head
    optimizer = optim.Adam(model.classifier.parameters(), lr=LR)
    scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=3, gamma=0.5)

    best_val_acc = 0.0
    print(f"{'─'*55}")
    print(f"Phase 1 – Training classifier head ({NUM_EPOCHS} epochs)")
    print(f"{'─'*55}")

    for epoch in range(NUM_EPOCHS):
        t0 = time.time()
        model.train()
        run_loss, correct, total = 0.0, 0, 0

        for imgs, labels in train_loader:
            imgs, labels = imgs.to(device), labels.to(device)
            optimizer.zero_grad()
            out  = model(imgs)
            loss = criterion(out, labels)
            loss.backward()
            optimizer.step()

            run_loss += loss.item() * imgs.size(0)
            correct  += (out.argmax(1) == labels).sum().item()
            total    += labels.size(0)

        scheduler.step()
        tr_loss = run_loss / total
        tr_acc  = correct  / total
        vl_loss, vl_acc = evaluate(model, val_loader, criterion, device)
        elapsed = time.time() - t0

        print(f"Epoch {epoch+1:02d}/{NUM_EPOCHS}  [{elapsed:.0f}s]  "
              f"Train {tr_acc*100:.1f}% loss={tr_loss:.4f}  "
              f"Val {vl_acc*100:.1f}% loss={vl_loss:.4f}", end="")

        if vl_acc > best_val_acc:
            best_val_acc = vl_acc
            torch.save({
                'model_state_dict': model.state_dict(),
                'classes': classes,
                'val_acc': best_val_acc,
            }, SAVE_PATH)
            print(f"  ← saved ✓")
        else:
            print()

    # Phase 2: fine-tune semua layer
    print(f"\n{'─'*55}")
    print(f"Phase 2 – Fine-tuning all layers (3 epochs)")
    print(f"{'─'*55}")
    for param in model.features.parameters():
        param.requires_grad = True
    optimizer2 = optim.Adam(model.parameters(), lr=LR_FINETUNE)

    for epoch in range(3):
        t0 = time.time()
        model.train()
        run_loss, correct, total = 0.0, 0, 0
        for imgs, labels in train_loader:
            imgs, labels = imgs.to(device), labels.to(device)
            optimizer2.zero_grad()
            out  = model(imgs)
            loss = criterion(out, labels)
            loss.backward()
            optimizer2.step()
            run_loss += loss.item() * imgs.size(0)
            correct  += (out.argmax(1) == labels).sum().item()
            total    += labels.size(0)

        tr_loss = run_loss / total
        tr_acc  = correct / total
        vl_loss, vl_acc = evaluate(model, val_loader, criterion, device)
        elapsed = time.time() - t0

        print(f"FT Epoch {epoch+1}/3  [{elapsed:.0f}s]  "
              f"Train {tr_acc*100:.1f}%  Val {vl_acc*100:.1f}%", end="")

        if vl_acc > best_val_acc:
            best_val_acc = vl_acc
            torch.save({
                'model_state_dict': model.state_dict(),
                'classes': classes,
                'val_acc': best_val_acc,
            }, SAVE_PATH)
            print(f"  ← saved ✓")
        else:
            print()

    print(f"\n{'='*55}")
    print(f"Training selesai!")
    print(f"Best Val Accuracy: {best_val_acc*100:.1f}%")
    print(f"Model disimpan di: {SAVE_PATH}")
    print(f"{'='*55}\n")


if __name__ == "__main__":
    train()
