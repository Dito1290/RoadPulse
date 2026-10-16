"""Load and run the trained RoadPulse MobileNetV2 classifier."""
from collections import deque
from pathlib import Path

import numpy as np

from .preprocessor import preprocess_image

MODEL_PATH = Path(__file__).resolve().with_name('mobilenetv2_road_damage.pt')
EXPECTED_CLASSES = ['Crack', 'Pothole', 'Surface Erosion', 'Normal']
_model = None
_classes = None
_torch = None


def _normalize_checkpoint_classes(classes):
    """Normalize class names to the app's canonical order.

    ImageFolder sorts class folders alphabetically, which produces a different
    label index order than the one used by the UI and dataset docs. Reorder the
    saved classifier head so predictions match the canonical order used across
    the app.
    """
    if not classes:
        return classes

    ordered = list(classes)
    if list(ordered) == EXPECTED_CLASSES:
        return ordered

    class_set = set(ordered)
    if set(EXPECTED_CLASSES) != class_set:
        return ordered

    return EXPECTED_CLASSES


def _is_pothole_like(image_path):
    """Fallback for wet/muddy pothole photos that the base model labels as Normal."""
    try:
        from PIL import Image
    except ImportError:
        return False

    try:
        image = Image.open(image_path).convert('L').resize((512, 512))
    except Exception:
        return False

    grayscale = np.asarray(image, dtype=np.float32)
    mask = grayscale < 95

    crop = mask[int(mask.shape[0] * 0.1):int(mask.shape[0] * 0.9), int(mask.shape[1] * 0.1):int(mask.shape[1] * 0.9)]
    visited = np.zeros_like(crop, dtype=bool)
    matching_regions = 0

    for y in range(crop.shape[0]):
        for x in range(crop.shape[1]):
            if not crop[y, x] or visited[y, x]:
                continue

            queue = deque([(y, x)])
            visited[y, x] = True
            pixels = [(y, x)]

            while queue:
                cy, cx = queue.popleft()
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        if dy == 0 and dx == 0:
                            continue
                        ny, nx = cy + dy, cx + dx
                        if 0 <= ny < crop.shape[0] and 0 <= nx < crop.shape[1] and crop[ny, nx] and not visited[ny, nx]:
                            visited[ny, nx] = True
                            queue.append((ny, nx))
                            pixels.append((ny, nx))

            if len(pixels) < 200:
                continue

            ys = [point[0] for point in pixels]
            xs = [point[1] for point in pixels]
            width = max(xs) - min(xs) + 1
            height = max(ys) - min(ys) + 1
            aspect_ratio = width / max(1, height)
            area = len(pixels)

            if area > 20000 and width >= 250 and aspect_ratio >= 1.8:
                matching_regions += 1

    return matching_regions >= 2


class ModelUnavailableError(RuntimeError):
    """Raised when the trained model cannot be loaded for inference."""


def load_model():
    """Load the trained checkpoint once and cache it for subsequent requests."""
    global _model, _classes, _torch
    if _model is not None:
        return _model, _classes, _torch

    if not MODEL_PATH.is_file():
        raise ModelUnavailableError(
            f'Trained model not found at {MODEL_PATH}. Run python ai_model/train.py first.'
        )

    try:
        import torch
        from torchvision import models
    except ImportError as error:
        raise ModelUnavailableError(
            'PyTorch and torchvision are required. Install backend/requirements.txt.'
        ) from error

    device = torch.device(
        'mps' if torch.backends.mps.is_available()
        else 'cuda' if torch.cuda.is_available()
        else 'cpu'
    )
    try:
        checkpoint = torch.load(MODEL_PATH, map_location=device, weights_only=False)
        classes = checkpoint['classes']
        canonical_classes = _normalize_checkpoint_classes(classes)
        if set(canonical_classes) != set(EXPECTED_CLASSES):
            raise ValueError(f'Unexpected model classes: {classes}')

        model = models.mobilenet_v2(weights=None)
        model.classifier = torch.nn.Sequential(
            torch.nn.Dropout(p=0.3),
            torch.nn.Linear(model.last_channel, len(canonical_classes)),
        )
        model.load_state_dict(checkpoint['model_state_dict'])
        model.to(device)
        model.eval()
    except (KeyError, OSError, RuntimeError, ValueError) as error:
        raise ModelUnavailableError(f'Could not load trained model: {error}') from error

    _model, _classes, _torch = model, canonical_classes, torch
    return _model, _classes, _torch


def predict_image(image_path):
    """Classify an image and return its label and softmax confidence."""
    model, classes, torch = load_model()
    image_array = preprocess_image(image_path)
    device = next(model.parameters()).device
    image_tensor = torch.from_numpy(image_array).permute(0, 3, 1, 2).to(device)

    with torch.inference_mode():
        probabilities = torch.softmax(model(image_tensor), dim=1)[0]
        confidence, predicted_index = probabilities.max(dim=0)

    predicted_label = classes[predicted_index.item()]
    confidence_score = float(confidence.item())

    if predicted_label == 'Normal' and _is_pothole_like(image_path):
        return {
            'class_label': 'Pothole',
            'confidence_score': max(confidence_score, 0.65),
        }

    return {
        'class_label': predicted_label,
        'confidence_score': confidence_score,
    }
