"""
Image preprocessing utilities
"""
from PIL import Image, UnidentifiedImageError
import numpy as np


def preprocess_image(image_file, target_size=(224, 224)):
    """
    Preprocess uploaded image for model input
    
    Args:
        image_file: Django UploadedFile or file path
        target_size: Tuple (width, height) for resizing
        
    Returns:
        numpy.ndarray: Preprocessed image array
    """
    # Open image
    if isinstance(image_file, str):
        img = Image.open(image_file)
    else:
        img = Image.open(image_file)
    
    # Convert to RGB if necessary
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    # Resize to target size
    img = img.resize(target_size, Image.Resampling.LANCZOS)
    
    # Convert to numpy array
    img_array = np.array(img)
    
    # Match the normalization used by the MobileNetV2 training transforms.
    img_array = img_array.astype('float32') / 255.0
    img_array = (img_array - np.array([0.485, 0.456, 0.406], dtype='float32'))
    img_array = img_array / np.array([0.229, 0.224, 0.225], dtype='float32')
    
    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array


def validate_image(image_file, max_size_mb=10):
    """
    Validate uploaded image
    
    Args:
        image_file: Django UploadedFile
        max_size_mb: Maximum file size in MB
        
    Returns:
        tuple: (bool is_valid, str error_message)
    """
    # Check file size
    if image_file.size > max_size_mb * 1024 * 1024:
        return False, f"File size exceeds {max_size_mb}MB limit"
    
    # Check file extension
    allowed_extensions = ['.jpg', '.jpeg', '.png']
    file_name = image_file.name.lower()
    if not any(file_name.endswith(ext) for ext in allowed_extensions):
        return False, "Only JPEG and PNG images are allowed"
    
    try:
        # Try to open the image
        img = Image.open(image_file)
        img.verify()
        return True, ""
    except (UnidentifiedImageError, OSError, ValueError) as e:
        return False, f"Invalid image file: {str(e)}"
