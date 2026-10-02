"""Load and run the trained RoadPulse MobileNetV2 classifier."""
from pathlib import Path

from .preprocessor import preprocess_image

MODEL_PATH = Path(__file__).resolve().with_name('mobilenetv2_road_damage.pt')
EXPECTED_CLASSES = {'Crack', 'Pothole', 'Surface Erosion', 'Normal'}
_model = None
_classes = None
_torch = None


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
        if set(classes) != EXPECTED_CLASSES:
            raise ValueError(f'Unexpected model classes: {classes}')

        model = models.mobilenet_v2(weights=None)
        model.classifier = torch.nn.Sequential(
            torch.nn.Dropout(p=0.3),
            torch.nn.Linear(model.last_channel, len(classes)),
        )
        model.load_state_dict(checkpoint['model_state_dict'])
        model.to(device)
        model.eval()
    except (KeyError, OSError, RuntimeError, ValueError) as error:
        raise ModelUnavailableError(f'Could not load trained model: {error}') from error

    _model, _classes, _torch = model, classes, torch
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

    return {
        'class_label': classes[predicted_index.item()],
        'confidence_score': confidence.item(),
    }
