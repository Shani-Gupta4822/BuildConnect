from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User


class Professional(models.Model):

    PROVIDER_TYPES = [
        ('individual', 'Individual Professional'),
        ('contractor', 'Contractor'),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='professional_profile'
    )

    name = models.CharField(max_length=100)

    provider_type = models.CharField(
        max_length=20,
        choices=PROVIDER_TYPES,
        default='individual'
    )

    company_name = models.CharField(
        max_length=150,
        blank=True
    )

    service = models.CharField(max_length=100)

    experience = models.PositiveIntegerField()

    location = models.CharField(max_length=150)

    phone = models.CharField(max_length=15)

    team_size = models.PositiveIntegerField(default=1)

    completed_projects = models.PositiveIntegerField(default=0)

    rating = models.FloatField(default=0.0)

    rate = models.PositiveIntegerField(default=0)

    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.name


# 👇 PROFESSIONAL KE BAAD CUSTOMER
class Customer(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='customer_profile'
    )

    name = models.CharField(max_length=100)

    phone = models.CharField(
        max_length=15,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.name


class ConstructionProject(models.Model):

    QUALITY_CHOICES = [
        ('basic', 'Basic'),
        ('standard', 'Standard'),
        ('premium', 'Premium'),
        ('luxury', 'Luxury'),
    ]

    contractor = models.ForeignKey(
        Professional,
        on_delete=models.CASCADE,
        related_name='construction_projects'
    )

    title = models.CharField(
        max_length=200,
        default='Previous Construction Project'
    )

    plot_area = models.PositiveIntegerField()

    built_up_area = models.PositiveIntegerField()

    floors = models.PositiveIntegerField(default=1)

    location = models.CharField(max_length=150)

    construction_quality = models.CharField(
        max_length=20,
        choices=QUALITY_CHOICES
    )

    actual_cost = models.PositiveIntegerField()

    completion_year = models.PositiveIntegerField()

    description = models.TextField(blank=True)

    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.title} - {self.contractor.name}"


class PortfolioImage(models.Model):

    professional = models.ForeignKey(
        Professional,
        on_delete=models.CASCADE,
        related_name='portfolio_images'
    )

    project = models.ForeignKey(
        ConstructionProject,
        on_delete=models.CASCADE,
        related_name='images',
        null=True,
        blank=True
    )

    image = models.ImageField(
        upload_to='portfolio/'
    )

    description = models.CharField(
        max_length=200,
        blank=True
    )

    def __str__(self):
        return f"{self.professional.name} - Portfolio"