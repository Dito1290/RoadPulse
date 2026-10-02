from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='inspectionrecord',
            name='location_name',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='inspectionrecord',
            name='captured_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]