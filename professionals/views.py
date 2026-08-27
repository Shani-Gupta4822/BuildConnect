import os
import joblib
import pandas as pd

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import (
    IsAuthenticated,
    IsAuthenticatedOrReadOnly
)

from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

from .models import (
    Professional,
    PortfolioImage,
    Customer,
    ConstructionProject
)

from .serializers import (
    ProfessionalSerializer,
    PortfolioImageSerializer,
    ConstructionProjectSerializer
)


# =========================================================
# PROFESSIONAL LIST
# =========================================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def get_professionals(request):

    # -------------------------
    # GET ALL PROFESSIONALS
    # -------------------------

    if request.method == 'GET':

        professionals = Professional.objects.all()

        serializer = ProfessionalSerializer(
            professionals,
            many=True
        )

        return Response(
            serializer.data
        )

    # -------------------------
    # CREATE PROFESSIONAL
    # -------------------------

    serializer = ProfessionalSerializer(
        data=request.data
    )

    if serializer.is_valid():

        serializer.save()

        return Response(
            serializer.data,
            status=201
        )

    return Response(
        serializer.errors,
        status=400
    )


# =========================================================
# PROFESSIONAL DETAIL
# =========================================================

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticatedOrReadOnly])
def professional_detail(request, id):

    try:

        professional = Professional.objects.get(
            id=id
        )

    except Professional.DoesNotExist:

        return Response(
            {
                "error": "Professional not found"
            },
            status=404
        )

    # -------------------------
    # GET
    # -------------------------

    if request.method == 'GET':

        serializer = ProfessionalSerializer(
            professional
        )

        return Response(
            serializer.data
        )

    # -------------------------
    # PUT
    # -------------------------

    if request.method == 'PUT':

        serializer = ProfessionalSerializer(
            professional,
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data
            )

        return Response(
            serializer.errors,
            status=400
        )

    # -------------------------
    # PATCH
    # -------------------------

    if request.method == 'PATCH':

        serializer = ProfessionalSerializer(
            professional,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data
            )

        return Response(
            serializer.errors,
            status=400
        )

    # -------------------------
    # DELETE
    # -------------------------

    professional.delete()

    return Response(
        status=204
    )

# =========================================================
# UPLOAD PORTFOLIO PHOTO
# =========================================================

@api_view(['POST'])
def upload_portfolio_photo(request, id):

    try:
        professional = Professional.objects.get(id=id)
    except Professional.DoesNotExist:
        return Response(
            {"error": "Professional not found"},
            status=404
        )

    image = request.FILES.get('image')

    if not image:
        return Response(
            {"error": "Please select an image"},
            status=400
        )

    portfolio_image = PortfolioImage.objects.create(
        professional=professional,
        image=image,
        description=request.data.get('description', '')
    )

    return Response(
        {
            "message": "Photo uploaded successfully",
            "id": portfolio_image.id,
            "image": portfolio_image.image.url
        },
        status=201
    )

# =========================================================
# CREATE PROJECT
# + MULTIPLE IMAGES
# =========================================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def create_project(request, id):

    # -------------------------
    # FIND PROFESSIONAL
    # -------------------------

    try:

        professional = Professional.objects.get(
            id=id
        )

    except Professional.DoesNotExist:

        return Response(
            {
                "error": "Professional not found"
            },
            status=404
        )

    # =====================================================
    # GET
    # =====================================================

    if request.method == 'GET':

        return Response(
            {
                "message":
                    "Use POST to create a project",

                "professional_id":
                    professional.id,

                "professional":
                    professional.name,

                "company_name":
                    professional.company_name
            }
        )

    # =====================================================
    # POST
    # =====================================================

    title = request.data.get(
        'title'
    )

    location = request.data.get(
        'location'
    )

    construction_quality = request.data.get(
        'construction_quality'
    )

    description = request.data.get(
        'description',
        ''
    )

    # -------------------------
    # REQUIRED TEXT FIELDS
    # -------------------------

    if not title:

        return Response(
            {
                "error":
                    "Project title is required"
            },
            status=400
        )

    if not location:

        return Response(
            {
                "error":
                    "Location is required"
            },
            status=400
        )

    if not construction_quality:

        return Response(
            {
                "error":
                    "Construction quality is required"
            },
            status=400
        )

    # -------------------------
    # NUMERIC FIELDS
    # -------------------------

    try:

        plot_area = int(
            request.data.get(
                'plot_area'
            )
        )

        built_up_area = int(
            request.data.get(
                'built_up_area'
            )
        )

        floors = int(
            request.data.get(
                'floors'
            )
        )

        actual_cost = int(
            request.data.get(
                'actual_cost'
            )
        )

        completion_year = int(
            request.data.get(
                'completion_year'
            )
        )

    except (TypeError, ValueError):

        return Response(
            {
                "error":
                    "Invalid numeric data"
            },
            status=400
        )

    # =====================================================
    # CREATE PROJECT
    # =====================================================

    project = ConstructionProject.objects.create(

        contractor=professional,

        title=title,

        plot_area=plot_area,

        built_up_area=built_up_area,

        floors=floors,

        location=location,

        construction_quality=
            construction_quality,

        actual_cost=actual_cost,

        completion_year=completion_year,

        description=description
    )

    # =====================================================
    # MULTIPLE IMAGES
    # =====================================================

    images = request.FILES.getlist(
        'images'
    )

    for image in images:

        PortfolioImage.objects.create(

            professional=professional,

            project=project,

            image=image
        )

    # =====================================================
    # RESPONSE
    # =====================================================

    serializer = ConstructionProjectSerializer(
        project
    )

    return Response(
        serializer.data,
        status=201
    )


# =========================================================
# ML COST ESTIMATE
# + SIMILAR PREVIOUS PROJECTS
# =========================================================

@api_view(['POST'])
def estimate_cost(request):

    # =====================================================
    # INPUT DATA
    # =====================================================

    try:

        plot_area = int(
            request.data.get(
                'plot_area'
            )
        )

        built_up_area = int(
            request.data.get(
                'built_up_area'
            )
        )

        floors = int(
            request.data.get(
                'floors'
            )
        )

    except (TypeError, ValueError):

        return Response(
            {
                "error":
                    "Invalid numeric input"
            },
            status=400
        )

    location = request.data.get(
        'location'
    )

    construction_quality = request.data.get(
        'construction_quality'
    )

    if not location:

        return Response(
            {
                "error":
                    "Location is required"
            },
            status=400
        )

    if not construction_quality:

        return Response(
            {
                "error":
                    "Construction quality is required"
            },
            status=400
        )

    # =====================================================
    # LOAD ML MODEL
    # =====================================================

    model_path = os.path.join(

        settings.BASE_DIR,

        'professionals',

        'ml',

        'models',

        'cost_model.pkl'
    )

    if not os.path.exists(
        model_path
    ):

        return Response(
            {
                "error":
                    "ML model not found"
            },
            status=500
        )

    model = joblib.load(
        model_path
    )

    # =====================================================
    # CREATE ML INPUT
    # =====================================================

    input_data = pd.DataFrame(
        [
            {

                'plot_area':
                    plot_area,

                'built_up_area':
                    built_up_area,

                'floors':
                    floors,

                'location':
                    location,

                'construction_quality':
                    construction_quality
            }
        ]
    )

    # =====================================================
    # PREDICT COST
    # =====================================================

    prediction = model.predict(
        input_data
    )[0]

    estimated_cost = int(
        round(
            prediction
        )
    )

    # =====================================================
    # ESTIMATE RANGE
    # =====================================================

    lower_estimate = int(
        estimated_cost * 0.90
    )

    upper_estimate = int(
        estimated_cost * 1.10
    )

    # =====================================================
    # FIND SIMILAR PROJECTS
    # =====================================================

    projects = ConstructionProject.objects.filter(

        location__iexact=
            location,

        construction_quality=
            construction_quality
    )

    similar_projects = []

    for project in projects:

        area_difference = abs(
            project.built_up_area
            -
            built_up_area
        )

        floor_difference = abs(
            project.floors
            -
            floors
        )

        score = (
            area_difference
            +
            (floor_difference * 500)
        )

        similar_projects.append(
            (
                score,
                project
            )
        )

    # -------------------------
    # CLOSEST FIRST
    # -------------------------

    similar_projects.sort(
        key=lambda x: x[0]
    )

    # -------------------------
    # TOP 5
    # -------------------------

    similar_projects = (
        similar_projects[:5]
    )

    # =====================================================
    # BUILD PROJECT RESPONSE
    # =====================================================

    project_data = []

    for score, project in similar_projects:

        images = []

        for image in project.images.all():

            images.append(
                {

                    "id":
                        image.id,

                    "image":
                        image.image.url
                        if image.image
                        else None,

                    "description":
                        image.description
                }
            )

        project_data.append(
            {

                "id":
                    project.id,

                "title":
                    project.title,

                "contractor":
                    project.contractor.name,

                "company_name":
                    project.contractor.company_name,

                "provider_type":
                    project.contractor.provider_type,

                "rating":
                    project.contractor.rating,

                "is_verified":
                    project.contractor.is_verified,

                "plot_area":
                    project.plot_area,

                "built_up_area":
                    project.built_up_area,

                "floors":
                    project.floors,

                "location":
                    project.location,

                "construction_quality":
                    project.construction_quality,

                "actual_cost":
                    project.actual_cost,

                "completion_year":
                    project.completion_year,

                "description":
                    project.description,

                "created_at":
                    project.created_at,

                "images":
                    images
            }
        )

    # =====================================================
    # FINAL RESPONSE
    # =====================================================

    return Response(
        {

            "estimated_cost":
                estimated_cost,

            "estimated_range":
                {

                    "minimum":
                        lower_estimate,

                    "maximum":
                        upper_estimate
                },

            "similar_projects":
                project_data,

            "message":
                (
                    "AI estimate is based on "
                    "previous construction projects. "
                    "Actual cost may vary."
                )
        }
    )

# =========================================================
# PROFESSIONAL SIGNUP
# =========================================================

@api_view(['POST'])
def professional_signup(request):

    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    name = request.data.get('name')
    provider_type = request.data.get(
        'provider_type',
        'individual'
    )
    company_name = request.data.get(
        'company_name',
        ''
    )
    service = request.data.get('service')
    experience = request.data.get('experience')
    location = request.data.get('location')
    phone = request.data.get('phone')

    # Required account fields
    if not username or not password:
        return Response(
            {
                'error': 'Username and password are required'
            },
            status=400
        )

    # Required professional fields
    if not name or not service or not location or not phone:
        return Response(
            {
                'error': 'Professional details are required'
            },
            status=400
        )

    # Check username
    if User.objects.filter(username=username).exists():
        return Response(
            {
                'error': 'Username already exists'
            },
            status=400
        )

    # Create Django user
    user = User.objects.create_user(
        username=username,
        email=email or '',
        password=password
    )

    # Create professional profile
    professional = Professional.objects.create(
        user=user,
        name=name,
        provider_type=provider_type,
        company_name=company_name,
        service=service,
        experience=int(experience or 0),
        location=location,
        phone=phone
    )

    return Response(
        {
            'message': 'Professional account created successfully',
            'user_id': user.id,
            'professional_id': professional.id
        },
        status=201
    )

# =========================================================
# CUSTOMER SIGNUP
# =========================================================

@api_view(['POST'])
def customer_signup(request):

    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    name = request.data.get('name')
    phone = request.data.get('phone', '')

    # Required account fields
    if not username or not password:
        return Response(
            {
                'error': 'Username and password are required'
            },
            status=400
        )

    # Required customer field
    if not name:
        return Response(
            {
                'error': 'Name is required'
            },
            status=400
        )

    # Check username
    if User.objects.filter(username=username).exists():
        return Response(
            {
                'error': 'Username already exists'
            },
            status=400
        )

    # Create Django user
    user = User.objects.create_user(
        username=username,
        email=email or '',
        password=password
    )

    # Create customer profile
    customer = Customer.objects.create(
        user=user,
        name=name,
        phone=phone
    )

    return Response(
        {
            'message': 'Customer account created successfully',
            'user_id': user.id,
            'customer_id': customer.id
        },
        status=201
    )

# =========================================================
# LOGIN
# =========================================================

@api_view(['POST'])
def login_user(request):

    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'error': 'Username and password are required'},
            status=400
        )

    user = authenticate(
        username=username,
        password=password
    )

    if user is None:
        return Response(
            {'error': 'Invalid username or password'},
            status=401
        )

    role = None
    profile_id = None
    name = user.username

    try:
        professional = user.professional_profile
        role = 'professional'
        profile_id = professional.id
        name = professional.name

    except Professional.DoesNotExist:

        try:
            customer = user.customer_profile
            role = 'customer'
            profile_id = customer.id
            name = customer.name

        except Customer.DoesNotExist:
            pass

    if role is None:
        return Response(
            {'error': 'Profile not found'},
            status=404
        )

    return Response({
        'message': 'Login successful',
        'user_id': user.id,
        'profile_id': profile_id,
        'username': user.username,
        'name': name,
        'role': role
    })

# =========================================================
# DELETE PROJECT
# =========================================================

@api_view(['DELETE'])
def delete_project(request, id):

    try:
        project = ConstructionProject.objects.get(id=id)
    except ConstructionProject.DoesNotExist:
        return Response(
            {'error': 'Project not found'},
            status=404
        )

    project.delete()

    return Response({
        'message': 'Project deleted successfully'
    })


# =========================================================
# DELETE PORTFOLIO IMAGE
# =========================================================

@api_view(['DELETE'])
def delete_portfolio_image(request, id):

    try:
        image = PortfolioImage.objects.get(id=id)
    except PortfolioImage.DoesNotExist:
        return Response(
            {'error': 'Image not found'},
            status=404
        )

    image.delete()

    return Response({
        'message': 'Photo deleted successfully'
    })