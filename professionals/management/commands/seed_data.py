from django.core.management.base import BaseCommand
from professionals.models import Professional, ConstructionProject


class Command(BaseCommand):

    def handle(self, *args, **kwargs):

        # =========================
        # PROFESSIONALS
        # =========================

        professionals = [

            # Individual Professionals

            {
                "name": "Raj Kumar",
                "provider_type": "individual",
                "service": "Painter",
                "experience": 8,
                "location": "Greater Noida",
                "phone": "9876543210",
                "team_size": 3,
                "completed_projects": 85,
                "rating": 4.8,
                "is_verified": True,
            },

            {
                "name": "Amit Sharma",
                "provider_type": "individual",
                "service": "Plumber",
                "experience": 10,
                "location": "Noida",
                "phone": "9876543211",
                "team_size": 2,
                "completed_projects": 120,
                "rating": 4.7,
                "is_verified": True,
            },

            {
                "name": "Rohit Singh",
                "provider_type": "individual",
                "service": "Electrician",
                "experience": 7,
                "location": "Ghaziabad",
                "phone": "9876543212",
                "team_size": 2,
                "completed_projects": 70,
                "rating": 4.6,
                "is_verified": True,
            },

            {
                "name": "Vikas Sharma",
                "provider_type": "individual",
                "service": "Carpenter",
                "experience": 12,
                "location": "Delhi",
                "phone": "9876543213",
                "team_size": 4,
                "completed_projects": 150,
                "rating": 4.9,
                "is_verified": True,
            },

            {
                "name": "Mohit Verma",
                "provider_type": "individual",
                "service": "Tile Worker",
                "experience": 6,
                "location": "Greater Noida",
                "phone": "9876543214",
                "team_size": 3,
                "completed_projects": 65,
                "rating": 4.5,
                "is_verified": False,
            },

            # Contractors

            {
                "name": "Sharma Construction",
                "provider_type": "contractor",
                "company_name": "Sharma Construction",
                "service": "Complete House Construction",
                "experience": 15,
                "location": "Greater Noida",
                "phone": "9876543220",
                "team_size": 25,
                "completed_projects": 48,
                "rating": 4.9,
                "is_verified": True,
            },

            {
                "name": "Gupta Builders",
                "provider_type": "contractor",
                "company_name": "Gupta Builders",
                "service": "Complete House Construction",
                "experience": 12,
                "location": "Noida",
                "phone": "9876543221",
                "team_size": 18,
                "completed_projects": 36,
                "rating": 4.7,
                "is_verified": True,
            },

            {
                "name": "Modern Homes",
                "provider_type": "contractor",
                "company_name": "Modern Homes",
                "service": "Residential Construction",
                "experience": 10,
                "location": "Ghaziabad",
                "phone": "9876543222",
                "team_size": 15,
                "completed_projects": 29,
                "rating": 4.6,
                "is_verified": True,
            },

            {
                "name": "Singh Construction",
                "provider_type": "contractor",
                "company_name": "Singh Construction",
                "service": "House Construction & Renovation",
                "experience": 18,
                "location": "Delhi",
                "phone": "9876543223",
                "team_size": 30,
                "completed_projects": 72,
                "rating": 4.9,
                "is_verified": True,
            },

            {
                "name": "Royal Buildtech",
                "provider_type": "contractor",
                "company_name": "Royal Buildtech",
                "service": "Luxury House Construction",
                "experience": 14,
                "location": "Greater Noida",
                "phone": "9876543224",
                "team_size": 22,
                "completed_projects": 41,
                "rating": 4.8,
                "is_verified": True,
            },
        ]

        created_professionals = 0

        for data in professionals:

            professional, created = Professional.objects.get_or_create(
                name=data["name"],
                defaults=data
            )

            if created:
                created_professionals += 1

        # =========================
        # PAST CONSTRUCTION PROJECTS
        # =========================

        projects = [

            {
                "contractor": "Sharma Construction",
                "plot_area": 1000,
                "built_up_area": 1800,
                "floors": 1,
                "location": "Greater Noida",
                "construction_quality": "basic",
                "actual_cost": 2200000,
                "completion_year": 2023,
            },

            {
                "contractor": "Sharma Construction",
                "plot_area": 1200,
                "built_up_area": 2200,
                "floors": 2,
                "location": "Greater Noida",
                "construction_quality": "standard",
                "actual_cost": 3200000,
                "completion_year": 2023,
            },

            {
                "contractor": "Sharma Construction",
                "plot_area": 1500,
                "built_up_area": 2800,
                "floors": 2,
                "location": "Greater Noida",
                "construction_quality": "premium",
                "actual_cost": 4800000,
                "completion_year": 2024,
            },

            {
                "contractor": "Sharma Construction",
                "plot_area": 1800,
                "built_up_area": 3400,
                "floors": 2,
                "location": "Greater Noida",
                "construction_quality": "premium",
                "actual_cost": 5900000,
                "completion_year": 2025,
            },

            {
                "contractor": "Gupta Builders",
                "plot_area": 900,
                "built_up_area": 1600,
                "floors": 1,
                "location": "Noida",
                "construction_quality": "basic",
                "actual_cost": 2100000,
                "completion_year": 2023,
            },

            {
                "contractor": "Gupta Builders",
                "plot_area": 1100,
                "built_up_area": 2000,
                "floors": 2,
                "location": "Noida",
                "construction_quality": "standard",
                "actual_cost": 3000000,
                "completion_year": 2024,
            },

            {
                "contractor": "Gupta Builders",
                "plot_area": 1400,
                "built_up_area": 2600,
                "floors": 2,
                "location": "Noida",
                "construction_quality": "premium",
                "actual_cost": 4500000,
                "completion_year": 2025,
            },

            {
                "contractor": "Modern Homes",
                "plot_area": 1000,
                "built_up_area": 1900,
                "floors": 1,
                "location": "Ghaziabad",
                "construction_quality": "standard",
                "actual_cost": 2600000,
                "completion_year": 2023,
            },

            {
                "contractor": "Modern Homes",
                "plot_area": 1300,
                "built_up_area": 2400,
                "floors": 2,
                "location": "Ghaziabad",
                "construction_quality": "standard",
                "actual_cost": 3500000,
                "completion_year": 2024,
            },

            {
                "contractor": "Modern Homes",
                "plot_area": 1600,
                "built_up_area": 3000,
                "floors": 2,
                "location": "Ghaziabad",
                "construction_quality": "premium",
                "actual_cost": 5100000,
                "completion_year": 2025,
            },

            {
                "contractor": "Singh Construction",
                "plot_area": 1200,
                "built_up_area": 2300,
                "floors": 2,
                "location": "Delhi",
                "construction_quality": "standard",
                "actual_cost": 3600000,
                "completion_year": 2023,
            },

            {
                "contractor": "Singh Construction",
                "plot_area": 1500,
                "built_up_area": 2900,
                "floors": 2,
                "location": "Delhi",
                "construction_quality": "premium",
                "actual_cost": 5200000,
                "completion_year": 2024,
            },

            {
                "contractor": "Singh Construction",
                "plot_area": 2000,
                "built_up_area": 4000,
                "floors": 3,
                "location": "Delhi",
                "construction_quality": "luxury",
                "actual_cost": 9500000,
                "completion_year": 2025,
            },

            {
                "contractor": "Royal Buildtech",
                "plot_area": 1500,
                "built_up_area": 2800,
                "floors": 2,
                "location": "Greater Noida",
                "construction_quality": "premium",
                "actual_cost": 5000000,
                "completion_year": 2023,
            },

            {
                "contractor": "Royal Buildtech",
                "plot_area": 1800,
                "built_up_area": 3500,
                "floors": 2,
                "location": "Greater Noida",
                "construction_quality": "luxury",
                "actual_cost": 7500000,
                "completion_year": 2024,
            },

            {
                "contractor": "Royal Buildtech",
                "plot_area": 2200,
                "built_up_area": 4500,
                "floors": 3,
                "location": "Greater Noida",
                "construction_quality": "luxury",
                "actual_cost": 11000000,
                "completion_year": 2025,
            },
        ]

        created_projects = 0

        for data in projects:

            contractor = Professional.objects.get(
                name=data["contractor"]
            )

            project, created = ConstructionProject.objects.get_or_create(
                contractor=contractor,
                plot_area=data["plot_area"],
                built_up_area=data["built_up_area"],
                floors=data["floors"],
                completion_year=data["completion_year"],
                defaults={
                    "location": data["location"],
                    "construction_quality": data["construction_quality"],
                    "actual_cost": data["actual_cost"],
                }
            )

            if created:
                created_projects += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"{created_professionals} new professionals created."
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"{created_projects} construction projects created."
            )
        )