from django.db import models


class InspectionRecord(models.Model):
    """Model for storing road damage inspection records"""
    
    CLASS_CHOICES = [
        ('Crack', 'Crack'),
        ('Pothole', 'Pothole'),
        ('Surface Erosion', 'Surface Erosion'),
        ('Normal', 'Normal'),
    ]
    
    image = models.ImageField(upload_to='uploads/')
    class_label = models.CharField(max_length=20, choices=CLASS_CHOICES)
    confidence_score = models.FloatField()
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    location_name = models.CharField(max_length=255, blank=True, default='')
    captured_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.class_label} - {self.confidence_score:.2f} ({self.created_at})"
