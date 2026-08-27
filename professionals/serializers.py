from rest_framework import serializers
from .models import (
    Professional,
    PortfolioImage,
    ConstructionProject
)


class PortfolioImageSerializer(serializers.ModelSerializer):

    image = serializers.SerializerMethodField()

    class Meta:
        model = PortfolioImage
        fields = '__all__'

    def get_image(self, obj):
        request = self.context.get('request')

        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url

        return None


class ConstructionProjectSerializer(serializers.ModelSerializer):

    images = PortfolioImageSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = ConstructionProject
        fields = '__all__'


class ProfessionalSerializer(serializers.ModelSerializer):

    portfolio_images = PortfolioImageSerializer(
        many=True,
        read_only=True
    )

    construction_projects = ConstructionProjectSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Professional
        fields = '__all__'