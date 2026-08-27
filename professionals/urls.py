from django.urls import path

from .views import (
    get_professionals,
    professional_detail,
    create_project,
    estimate_cost,
    professional_signup,
    customer_signup,
    login_user,
    delete_project,
    upload_portfolio_photo,
    delete_portfolio_image
)

urlpatterns = [

    path(
        'professionals/',
        get_professionals
    ),

    path(
        'professionals/<int:id>/',
        professional_detail
    ),

    path(
        'professionals/<int:id>/projects/',
        create_project
    ),

    path(
        'estimate/',
        estimate_cost
    ),

    path(
        'signup/professional/',
        professional_signup
    ),

    path(
        'signup/customer/',
        customer_signup
    ),
    path(
    'login/',
    login_user
),
path(
    'projects/<int:id>/delete/',
    delete_project
),

path(
    'portfolio/<int:id>/delete/',
    delete_portfolio_image
),
path(
    'professionals/<int:id>/photos/',
    upload_portfolio_photo
),
]