import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000/api/professionals/";

/*
  Demo images:
  Real Django-uploaded images are always preferred.
  These are only fallbacks so the feed never looks empty during demo/development.
*/
const DEMO_IMAGES = {
  contractor: [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=85",
  ],
  painter: [
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1615529162924-f8605388461d?auto=format&fit=crop&w=1200&q=85",
  ],
  carpenter: [
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1600566753051-f0b89df2dd90?auto=format&fit=crop&w=1200&q=85",
  ],
  electrician: [
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85",
  ],
  plumber: [
    "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85",
  ],
  mason: [
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1600047508788-786b4f1e4c1b?auto=format&fit=crop&w=1200&q=85",
  ],
  default: [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=85",
  ],
};

const DEMO_COSTS = {
  painter: 75000,
  carpenter: 145000,
  electrician: 95000,
  plumber: 125000,
  mason: 800,
  tile: 135000,
  interior: 275000,
  contractor: 4800000,
  default: 75000,
};

function getServiceKey(professional = {}) {
  const text = `${professional.service || ""} ${professional.name || ""}`.toLowerCase();

  if (text.includes("paint")) return "painter";
  if (text.includes("carpent")) return "carpenter";
  if (text.includes("electric")) return "electrician";
  if (text.includes("plumb") || text.includes("bathroom")) return "plumber";
  if (text.includes("tile")) return "tile";
  if (text.includes("mason") || text.includes("brick")) return "mason";
  if (text.includes("interior")) return "interior";
  if (professional.provider_type === "contractor") return "contractor";

  return "default";
}

function getDemoImages(professional, count = 3) {
  const key = getServiceKey(professional);
  const source = DEMO_IMAGES[key] || DEMO_IMAGES.default;

  return Array.from(
    { length: count },
    (_, index) => source[index % source.length]
  );
}

function getImageUrl(image) {
  if (!image) return "";

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  if (image.startsWith("/")) {
    return `http://127.0.0.1:8000${image}`;
  }

  return `http://127.0.0.1:8000/${image}`;
}

function getProfessionalCost(professional, project = null) {

  // Contractor ke liye actual construction project cost
  if (professional?.provider_type === "contractor" && project?.actual_cost) {
    return Number(project.actual_cost);
  }

  // Individual professionals ke liye demo/service price
  const key = getServiceKey(professional);

  return DEMO_COSTS[key] || DEMO_COSTS.default;
}

function formatCurrency(value, professional = {}) {
  const number = Number(value || 0);
  const key = getServiceKey(professional);

  if (
    professional?.provider_type === "individual" &&
    key === "mason"
  ) {
    return `₹${number.toLocaleString("en-IN")}/day`;
  }

  return `₹${number.toLocaleString("en-IN")}`;
}


function App() {

  const [professionals, setProfessionals] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [activeCategory, setActiveCategory] = useState("All");

  const [search, setSearch] = useState("");

  const [showEstimator, setShowEstimator] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [showDashboard, setShowDashboard] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
const [showPhotos, setShowPhotos] = useState(false);
const [showProfile, setShowProfile] = useState(false);
const [profileData, setProfileData] = useState(null);
const [profilePhotos, setProfilePhotos] = useState([]);
const [profileLoading, setProfileLoading] = useState(false);
  const [signupData, setSignupData] = useState({
  name: "",
  username: "",
  email: "",
  password: "",
  phone: "",
  service: "",
  experience: "",
  location: "",
  provider_type: "individual",
  company_name: "",
});
const [customerData, setCustomerData] = useState({
  name: "",
  username: "",
  email: "",
  password: "",
  phone: "",
});
const [loginUsername, setLoginUsername] = useState("");
const [loginPassword, setLoginPassword] = useState("");
  const [plotArea, setPlotArea] = useState("");
  const [builtUpArea, setBuiltUpArea] = useState("");
  const [floors, setFloors] = useState("");
  const [constructionQuality, setConstructionQuality] = useState("standard");
  const [estimateResult, setEstimateResult] = useState(null);

  const handleEstimate = async () => {
  if (!plotArea || !builtUpArea || !floors) {
    alert("Please fill all required fields.");
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/api/estimate/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plot_area: Number(plotArea),
        built_up_area: Number(builtUpArea),
        floors: Number(floors),
        location: "Greater Noida",
        construction_quality: constructionQuality,
      }),
    });

    const data = await response.json();

    console.log("ML Estimate:", data);

    if (!response.ok) {
      alert(data.error || "Estimate failed");
      return;
    }

setEstimateResult(data);  
} catch (error) {
    console.error(error);
    alert("Unable to connect to Django server.");
  }
};
  useEffect(() => {
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch professionals");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Django API data:", data);

        const list = Array.isArray(data) ? data : data.results || [];

        setProfessionals(list);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to connect with Django server.");
        setLoading(false);
      });
  }, []);

  const filteredProfessionals = professionals.filter((professional) => {
    const searchText = search.trim().toLowerCase();
    const service = `${professional.service || ""}`.toLowerCase();

    const matchesSearch =
      !searchText ||
      `${professional.name || ""} ${professional.company_name || ""} ${professional.service || ""} ${professional.provider_type || ""} ${professional.location || ""}`
        .toLowerCase()
        .includes(searchText);

    const categoryMap = {
      All: true,
      Contractors: professional.provider_type === "contractor",
      Painters: service.includes("paint"),
      Carpenters: service.includes("carpent"),
      Electricians: service.includes("electric"),
      Plumbers: service.includes("plumb") || service.includes("bathroom"),
      Mason: service.includes("mason") || service.includes("brick"),
    };

    return matchesSearch && categoryMap[activeCategory];
  });

  if (loading) {
    return (
      <div className="loading-screen">
        <h2>BuildConnect</h2>
        <p>Loading professionals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-screen">
        <h2>BuildConnect</h2>
        <p>{error}</p>
        <small>Make sure Django is running on port 8000.</small>
      </div>
    );
  }
  const handleProfessionalSignup = async () => {
  try {
    const response = await fetch(
      "http://127.0.0.1:8000/api/signup/professional/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Signup failed");
      return;
    }

    alert("Professional account created successfully!");

    setShowAuth(false);

    setSignupData({
      name: "",
      username: "",
      email: "",
      password: "",
      phone: "",
      service: "",
      experience: "",
      location: "",
      provider_type: "individual",
      company_name: "",
    });

  } catch (error) {
  console.error("SIGNUP ERROR:", error);
  alert("Signup error: " + error.message);
}
};
const handleCustomerSignup = async () => {
  try {
    const response = await fetch(
      "http://127.0.0.1:8000/api/signup/customer/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Customer signup failed");
      return;
    }

    alert("Customer account created successfully!");

    setShowAuth(false);

    setCustomerData({
      name: "",
      username: "",
      email: "",
      password: "",
      phone: "",
    });

  } catch (error) {
    console.error("CUSTOMER SIGNUP ERROR:", error);
    alert("Unable to connect with Django server.");
  }
};
const handleLogin = async () => {
  try {
    const response = await fetch(
      "http://127.0.0.1:8000/api/login/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Login failed");
      return;
    }

    localStorage.setItem(
      "buildconnect_user",
      JSON.stringify(data)
    );

    alert(`Welcome ${data.name}!`);

localStorage.setItem(
  "buildconnect_user",
  JSON.stringify(data)
);

setShowAuth(false);

if (data.role === "professional") {
  setShowDashboard(true);
}

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    alert("Unable to connect with Django server.");
  }
};

const handleLogout = () => {
  localStorage.removeItem("buildconnect_user");

  setShowDashboard(false);
  setShowProfile(false);
  setShowAuth(false);

  alert("Logged out successfully!");
};

const handleProfile = async () => {
  const user = JSON.parse(
    localStorage.getItem("buildconnect_user")
  );

  if (!user || user.role !== "professional") {
    alert("Please login as a professional.");
    return;
  }

  try {
    setProfileLoading(true);

    const response = await fetch(
      `http://127.0.0.1:8000/api/professionals/${user.profile_id}/`
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Unable to load profile");
      return;
    }

    setProfileData(data);

    setProfilePhotos(data.portfolio_images || []);

    setShowProfile(true);

  } catch (error) {
    console.error(error);
    alert("Unable to connect with Django server.");
  } finally {
    setProfileLoading(false);
  }
};

  return (
    <div className="app">
      {showAuth && (
  <div
    className="auth-overlay"
    onClick={() => setShowAuth(false)}
  >
    <div
      className="auth-modal"
      onClick={(e) => e.stopPropagation()}
    >

      <button
        className="auth-close"
        onClick={() => setShowAuth(false)}
      >
        ×
      </button>

{authMode === "login" ? (
  <>
    <h2>Welcome to BuildConnect</h2>
    <p>Login to continue</p>

    <div className="auth-form">

      <label>
        Username
        <input
  type="text"
  placeholder="Enter username"
  value={loginUsername}
  onChange={(e) => setLoginUsername(e.target.value)}
/>
      </label>

      <label>
        Password
       <input
  type="password"
  placeholder="Enter password"
  value={loginPassword}
  onChange={(e) => setLoginPassword(e.target.value)}
/>
      </label>

      <button
  className="auth-submit"
  onClick={handleLogin}
>
  Login
</button>

    </div>

    <p className="auth-switch">
      New to BuildConnect?{" "}
      <button
        onClick={() => setAuthMode("signup")}
      >
        Create Account
      </button>
    </p>
  </>
) : authMode === "professional-signup" ? (
  <>
    <h2>Create Professional Account</h2>
    <p>Join BuildConnect as a professional</p>

    <div className="auth-form">

      <label>
        Name
        <input
          type="text"
          placeholder="Your full name"
          value={signupData.name}
          onChange={(e) =>
            setSignupData({
              ...signupData,
              name: e.target.value
            })
          }
        />
      </label>

      <label>
        Username
        <input
          type="text"
          placeholder="Choose username"
          value={signupData.username}
          onChange={(e) =>
            setSignupData({
              ...signupData,
              username: e.target.value
            })
          }
        />
      </label>

      <label>
        Email
        <input
          type="email"
          placeholder="Email address"
          value={signupData.email}
          onChange={(e) =>
            setSignupData({
              ...signupData,
              email: e.target.value
            })
          }
        />
      </label>

      <label>
        Password
        <input
          type="password"
          placeholder="Create password"
          value={signupData.password}
          onChange={(e) =>
            setSignupData({
              ...signupData,
              password: e.target.value
            })
          }
        />
      </label>

      <label>
        Phone
        <input
          type="text"
          placeholder="Phone number"
          value={signupData.phone}
          onChange={(e) =>
            setSignupData({
              ...signupData,
              phone: e.target.value
            })
          }
        />
      </label>

      <label>
        Service
        <input
          type="text"
          placeholder="e.g. Painter, Plumber"
          value={signupData.service}
          onChange={(e) =>
            setSignupData({
              ...signupData,
              service: e.target.value
            })
          }
        />
      </label>

      <label>
        Experience
        <input
          type="number"
          min="0"
          placeholder="Years of experience"
          value={signupData.experience}
          onChange={(e) =>
            setSignupData({
              ...signupData,
              experience: e.target.value
            })
          }
        />
      </label>

      <label>
        Location
        <input
          type="text"
          placeholder="e.g. Greater Noida"
          value={signupData.location}
          onChange={(e) =>
            setSignupData({
              ...signupData,
              location: e.target.value
            })
          }
        />
      </label>

      <label>
        Professional Type
        <select
          value={signupData.provider_type}
          onChange={(e) =>
            setSignupData({
              ...signupData,
              provider_type: e.target.value
            })
          }
        >
          <option value="individual">
            Individual Professional
          </option>

          <option value="contractor">
            Contractor
          </option>
        </select>
      </label>

      {signupData.provider_type === "contractor" && (
        <label>
          Company Name
          <input
            type="text"
            placeholder="Company name"
            value={signupData.company_name}
            onChange={(e) =>
              setSignupData({
                ...signupData,
                company_name: e.target.value
              })
            }
          />
        </label>
      )}

     <button
  className="auth-submit"
  onClick={handleProfessionalSignup}
>
  Create Professional Account
</button>
    </div>

    <p className="auth-switch">
      Already have an account?{" "}
      <button
        onClick={() => setAuthMode("login")}
      >
        Login
      </button>
    </p>
  </>
  ) : authMode === "customer-signup" ? (
  <>
    <h2>Create Customer Account</h2>
    <p>Join BuildConnect as a customer</p>

    <div className="auth-form">

      <label>
        Name
        <input
          type="text"
          placeholder="Your full name"
          value={customerData.name}
          onChange={(e) =>
            setCustomerData({
              ...customerData,
              name: e.target.value
            })
          }
        />
      </label>

      <label>
        Username
        <input
          type="text"
          placeholder="Choose username"
          value={customerData.username}
          onChange={(e) =>
            setCustomerData({
              ...customerData,
              username: e.target.value
            })
          }
        />
      </label>

      <label>
        Email
        <input
          type="email"
          placeholder="Email address"
          value={customerData.email}
          onChange={(e) =>
            setCustomerData({
              ...customerData,
              email: e.target.value
            })
          }
        />
      </label>

      <label>
        Password
        <input
          type="password"
          placeholder="Create password"
          value={customerData.password}
          onChange={(e) =>
            setCustomerData({
              ...customerData,
              password: e.target.value
            })
          }
        />
      </label>

      <label>
        Phone
        <input
          type="text"
          placeholder="Phone number"
          value={customerData.phone}
          onChange={(e) =>
            setCustomerData({
              ...customerData,
              phone: e.target.value
            })
          }
        />
      </label>

      <button
  className="auth-submit"
  onClick={handleCustomerSignup}
>
  Create Customer Account
</button>

    </div>

    <p className="auth-switch">
      Already have an account?{" "}
      <button onClick={() => setAuthMode("login")}>
        Login
      </button>
    </p>
  </>
) : (
  <>
    <h2>Create Account</h2>
    <p>Join BuildConnect</p>

    <div className="auth-role-buttons">

      <button
        onClick={() => setAuthMode("customer-signup")}
      >
        👤 Customer
      </button>

      <button
        onClick={() => setAuthMode("professional-signup")}
      >
        👷 Professional
      </button>

    </div>

    <p className="auth-switch">
      Already have an account?{" "}
      <button
        onClick={() => setAuthMode("login")}
      >
        Login
      </button>
    </p>
  </>

)}
      </div>
    </div>
  )}

  {showDashboard && (
  <div
    className="dashboard-overlay"
    onClick={() => setShowDashboard(false)}
  >
    <div
      className="dashboard-modal"
      onClick={(e) => e.stopPropagation()}
    >

      <button
        className="auth-close"
        onClick={() => setShowDashboard(false)}
      >
        ×
      </button>

      <h2>Professional Dashboard</h2>

      <p>Manage your profile and projects</p>

      <div className="dashboard-actions">

        <button onClick={() => setShowAddProject(true)}>
  ➕ Add Project
</button>

        <button onClick={handleProfile}>
  📷 Manage Photos
</button>
        <button onClick={handleProfile}>
  👤 My Profile
</button>

      </div>

      <div className="dashboard-section">
        <h3>My Projects</h3>

        <p>
          Your construction projects will appear here.
        </p>
      </div>

    </div>
  </div>
)}

{showAddProject && (
  <div
    className="dashboard-overlay"
    onClick={() => setShowAddProject(false)}
  >
    <div
      className="dashboard-modal"
      onClick={(e) => e.stopPropagation()}
    >

      <button
        className="auth-close"
        onClick={() => setShowAddProject(false)}
      >
        ×
      </button>

      <h2>Add Construction Project</h2>
      <p>Add your completed project details</p>

      <div className="auth-form">

        <label>
          Project Title
          <input
            type="text"
            placeholder="e.g. Modern House"
          />
        </label>

        <label>
          Plot Area (sq ft)
          <input
            type="number"
            placeholder="e.g. 1500"
          />
        </label>

        <label>
          Built-up Area (sq ft)
          <input
            type="number"
            placeholder="e.g. 2800"
          />
        </label>

        <label>
          Number of Floors
          <input
            type="number"
            min="1"
            placeholder="e.g. 2"
          />
        </label>

        <label>
          Location
          <input
            type="text"
            placeholder="e.g. Noida"
          />
        </label>

        <label>
          Construction Quality
          <select defaultValue="standard">
            <option value="basic">Basic</option>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
            <option value="luxury">Luxury</option>
          </select>
        </label>

        <label>
          Actual Cost (₹)
          <input
            type="number"
            placeholder="e.g. 5500000"
          />
        </label>

        <label>
          Completion Year
          <input
            type="number"
            placeholder="e.g. 2026"
          />
        </label>

        <label>
          Description
          <textarea
            placeholder="Describe your project..."
            rows="4"
          />
        </label>

        <label>
          Project Photos
          <input
            type="file"
            accept="image/*"
            multiple
          />
        </label>

        <button className="auth-submit">
          Create Project
        </button>

      </div>

    </div>
  </div>
)}

{showProfile && (
  <div
    className="dashboard-overlay"
    onClick={() => setShowProfile(false)}
  >
    <div
      className="dashboard-modal"
      onClick={(e) => e.stopPropagation()}
    >

      <button
        className="auth-close"
        onClick={() => setShowProfile(false)}
      >
        ×
      </button>

      {profileLoading ? (
        <h2>Loading profile...</h2>
      ) : profileData ? (
        <>
          <h2>{profileData.name}</h2>

          <p>
            {profileData.service} • {profileData.location}
          </p>

          <div className="profile-info">
            <p>
              <strong>Experience:</strong>{" "}
              {profileData.experience} years
            </p>

            <p>
              <strong>Phone:</strong>{" "}
              {profileData.phone}
            </p>

            <p>
              <strong>Projects:</strong>{" "}
              {profileData.completed_projects}
            </p>

            <p>
              <strong>Rating:</strong>{" "}
              ⭐ {profileData.rating}
            </p>
          </div>

          <h3>My Portfolio</h3>

          <label className="photo-upload-btn">
            📷 Add Photo

            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={async (e) => {

                const file = e.target.files[0];

                if (!file) return;

                const user = JSON.parse(
                  localStorage.getItem("buildconnect_user")
                );

                const formData = new FormData();

                formData.append("image", file);

                try {

                  const response = await fetch(
                    `http://127.0.0.1:8000/api/professionals/${user.profile_id}/photos/`,
                    {
                      method: "POST",
                      body: formData,
                    }
                  );

                  const data = await response.json();

                  if (!response.ok) {
                    alert(data.error || "Upload failed");
                    return;
                  }

                  alert("Photo uploaded successfully!");

                  setProfilePhotos([
                    ...profilePhotos,
                    data
                  ]);

                } catch (error) {

                  alert(
                    "Unable to connect with Django server."
                  );

                }

              }}
            />
          </label>

          <div className="profile-photos">

            {profilePhotos.length === 0 ? (
              <p>No photos uploaded yet.</p>
            ) : (
              profilePhotos.map((photo) => (
                <div
                  className="profile-photo"
                  key={photo.id}
                >

                  <img
                    src={
                      photo.image.startsWith("http")
                        ? photo.image
                        : `http://127.0.0.1:8000${photo.image}`
                    }
                    alt="Portfolio"
                  />

                  <button
                    onClick={async () => {

                      const response = await fetch(
                        `http://127.0.0.1:8000/api/portfolio/${photo.id}/delete/`,
                        {
                          method: "DELETE",
                        }
                      );

                      if (response.ok) {

                        setProfilePhotos(
                          profilePhotos.filter(
                            (item) => item.id !== photo.id
                          )
                        );

                        alert("Photo deleted successfully!");

                      } else {

                        alert("Unable to delete photo.");

                      }

                    }}
                  >
                    🗑 Delete
                  </button>

                </div>
              ))
            )}

          </div>

        </>
      ) : (
        <p>Profile not found.</p>
      )}

    </div>
  </div>
)}
      {showEstimator && (
  <div
    className="estimate-modal-overlay"
    onClick={() => setShowEstimator(false)}
  >
    <div
      className="estimate-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="estimate-close"
        onClick={() => setShowEstimator(false)}
      >
        ×
      </button>

      <h2>AI Cost Estimate</h2>

      <p>
        Get an approximate construction cost for your project.
      </p>

      <div className="estimate-form">
        <label>
          Construction Area (sq ft)
          <input
  type="number"
  min="1"
  placeholder="Example: 1200"
  value={plotArea}
  onChange={(e) => setPlotArea(e.target.value)}
/>
        </label>
        <label>
  Built-up Area (sq ft)
  <input
  type="number"
  min="1"
  placeholder="Example: 1800"
  value={builtUpArea}
  onChange={(e) => setBuiltUpArea(e.target.value)}
/>
</label>

        <label>
  Number of Floors
  <input
  type="number"
  min="1"
  max="20"
  placeholder="Example: 2"
  value={floors}
  onChange={(e) => setFloors(e.target.value)}
/>
</label>

       <label>
  Construction Quality
  <select
    value={constructionQuality}
    onChange={(e) => setConstructionQuality(e.target.value)}
  >
    <option value="basic">Basic</option>
    <option value="standard">Standard</option>
    <option value="premium">Premium</option>
    <option value="luxury">Luxury</option>
  </select>
</label>

       <button
  className="calculate-btn"
  onClick={handleEstimate}
>
  Calculate Cost
</button>
{estimateResult && (
  <div className="estimate-result">

    <h3>🤖 ML Cost Estimate</h3>

    <div className="estimated-cost">
      ₹{Number(estimateResult.estimated_cost).toLocaleString("en-IN")}
    </div>

    <p className="estimate-subtitle">
      Estimated construction cost
    </p>

    <div className="estimate-details">

      <div className="estimate-detail">
        <small>Plot Area</small>
        <strong>{plotArea} sq ft</strong>
      </div>

      <div className="estimate-detail">
        <small>Built-up Area</small>
        <strong>{builtUpArea} sq ft</strong>
      </div>

      <div className="estimate-detail">
        <small>Floors</small>
        <strong>{floors}</strong>
      </div>

      <div className="estimate-detail">
        <small>Quality</small>
        <strong>
          {constructionQuality.charAt(0).toUpperCase() +
            constructionQuality.slice(1)}
        </strong>
      </div>

    </div>

    <button
      className="calculate-again-btn"
      onClick={() => setEstimateResult(null)}
    >
      Calculate Again
    </button>

  </div>
)}
      </div>
    </div>
  </div>
)}
      <header className="navbar">
        <div className="logo">
          <span className="logo-icon">B</span>
          <span>
            Build<span>Connect</span>
          </span>
        </div>

        <div className="search-box">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search contractors, painters, carpenters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="nav-actions">
          <button className="nav-link">Explore</button>
<button
  className="estimate-btn"
  onClick={() => setShowEstimator(true)}
>
  AI Cost Estimate
</button>     
     {localStorage.getItem("buildconnect_user") ? (
  <button
    className="login-btn"
    onClick={handleLogout}
  >
    Logout
  </button>
) : (
  <button
    className="login-btn"
    onClick={() => {
      setAuthMode("login");
      setShowAuth(true);
    }}
  >
    Login
  </button>
)}
        </div>
      </header>

      <main className="main-container">
        <section className="hero-section">
          <div className="hero-content">
            <p className="hero-small">BUILD • CONNECT • CREATE</p>

            <h1>
              Find the right professional
              <br />
              <span>for your dream project.</span>
            </h1>

            <p className="hero-description">
              Discover trusted contractors and professionals, explore their
              previous work and connect directly.
            </p>

            <div className="hero-buttons">
              <button className="primary-btn">Find Professionals</button>
              <button
  className="secondary-btn"
  onClick={() => setShowEstimator(true)}
>
  Estimate Construction Cost
</button>
            </div>
          </div>
        </section>

        <section className="category-section">
          {[
            ["All", "All"],
            ["🏠 Contractors", "Contractors"],
            ["🎨 Painters", "Painters"],
            ["🪚 Carpenters", "Carpenters"],
            ["⚡ Electricians", "Electricians"],
            ["🔧 Plumbers", "Plumbers"],
            ["🧱 Mason", "Mason"],
          ].map(([label, value]) => (
            <button
              key={value}
              className={`category ${
                activeCategory === value ? "active" : ""
              }`}
              onClick={() => setActiveCategory(value)}
            >
              {label}
            </button>
          ))}
        </section>

        <section className="feed-section">
          <div className="feed-heading">
            <div>
              <p className="feed-label">DISCOVER</p>
              <h2>Recent Work</h2>
            </div>

            <span className="professional-count">
              {filteredProfessionals.length} professionals
            </span>
          </div>

          <div className="feed">
            {filteredProfessionals.map((professional) => (
              <ProfessionalCard
                key={professional.id}
                professional={professional}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function ProfessionalCard({ professional }) {
  const projects =
    professional.construction_projects || professional.projects || [];

  const portfolio = professional.portfolio_images || [];

  /*
    Contractor projects are shown as individual Instagram-style posts.
  */
  if (projects.length > 0) {
    return (
      <>
        {projects.map((project) => (
          <ProjectPost
            key={`project-${project.id}`}
            professional={professional}
            project={project}
          />
        ))}
      </>
    );
  }

  /*
    Individual professionals with uploaded portfolio images.
  */
  if (portfolio.length > 0) {
    return (
      <PortfolioPost
        professional={professional}
        portfolio={portfolio}
      />
    );
  }

  /*
    Demo fallback:
    Even when a professional has no uploaded image yet, show a
    professional-looking post with a demo image and demo cost.
  */
  return <ProfessionalOnlyCard professional={professional} />;
}

function ProjectPost({ professional, project }) {
  const [currentImage, setCurrentImage] = useState(0);

  const uploadedImages =
    project.images
      ?.map((item) => getImageUrl(typeof item === "string" ? item : item.image))
      .filter(Boolean) || [];

  const images =
    uploadedImages.length > 0
      ? uploadedImages
      : getDemoImages(professional, 3);

  const nextImage = () => {
    setCurrentImage((currentImage + 1) % images.length);
  };

  const previousImage = () => {
    setCurrentImage(
      currentImage === 0 ? images.length - 1 : currentImage - 1
    );
  };

  return (
    <article className="project-card">
      <PostHeader professional={professional} />

      <ImageSlider
        images={images}
        currentImage={currentImage}
        nextImage={nextImage}
        previousImage={previousImage}
        alt={project.title || "Construction project"}
      />

      <div className="post-actions">
        <div className="left-actions">
          <button>♡</button>
          <button>♧</button>
          <button>↗</button>
        </div>
        <button>🔖</button>
      </div>

      <div className="post-content">
        <div className="title-cost-row">
          <h3>{project.title || "Previous Construction Project"}</h3>

          <div className="inline-cost">
            {formatCurrency(getProfessionalCost(professional, project), professional)}
          </div>
        </div>

        <p className="description">
          {project.description ||
            "Complete project details available on the professional profile."}
        </p>

        <div className="project-details">
          <Detail icon="📐" label="Plot" value={`${project.plot_area} sq.ft`} />
          <Detail
            icon="🏠"
            label="Built-up"
            value={`${project.built_up_area} sq.ft`}
          />
          <Detail icon="🏢" label="Floors" value={project.floors} />
        </div>

        <div className="cost-box">
          <div>
            <small>Previous project cost</small>
            <strong>
              {formatCurrency(getProfessionalCost(professional, project), professional)}
            </strong>
          </div>

          <span className="cost-note">Actual cost</span>
        </div>

        <div className="post-footer">
          <span>📍 {project.location || professional.location}</span>
          <span>{formatDate(project.created_at)}</span>
        </div>

        <CardButtons professional={professional} />
      </div>
    </article>
  );
}

function PortfolioPost({ professional, portfolio }) {
  const [currentImage, setCurrentImage] = useState(0);

  const uploadedImages = portfolio
    .map((item) => getImageUrl(typeof item === "string" ? item : item.image))
    .filter(Boolean);

  const images =
    uploadedImages.length > 0
      ? uploadedImages
      : getDemoImages(professional, 3);

  return (
    <article className="project-card">
      <PostHeader professional={professional} />

      <ImageSlider
        images={images}
        currentImage={currentImage}
        nextImage={() =>
          setCurrentImage((currentImage + 1) % images.length)
        }
        previousImage={() =>
          setCurrentImage(
            currentImage === 0 ? images.length - 1 : currentImage - 1
          )
        }
        alt={`${professional.service || "Professional"} work`}
      />

      <div className="post-actions">
        <div className="left-actions">
          <button>♡</button>
          <button>♧</button>
          <button>↗</button>
        </div>
        <button>🔖</button>
      </div>

      <div className="post-content">
        <div className="title-cost-row">
          <h3>{professional.service || "Professional Work"}</h3>

          <div className="inline-cost">
            {formatCurrency(getProfessionalCost(professional), professional)}
          </div>
        </div>

        <p className="description">
          Previous work by {professional.name}. Contact the professional for
          complete project details and quotation.
        </p>

        <div className="project-details">
          <Detail
            icon="🛠️"
            label="Experience"
            value={`${professional.experience || 0} years`}
          />
          <Detail
            icon="📁"
            label="Projects"
            value={`${professional.completed_projects || 0}+`}
          />
          <Detail
            icon="⭐"
            label="Rating"
            value={professional.rating || "New"}
          />
        </div>

        <div className="cost-box">
          <div>
            <small>Previous work cost</small>
            <strong>{formatCurrency(getProfessionalCost(professional), professional)}</strong>
          </div>

          <span className="cost-note">Actual / demo cost</span>
        </div>

        <div className="post-footer">
          <span>📍 {professional.location}</span>
          <span>Recent work</span>
        </div>

        <CardButtons professional={professional} />
      </div>
    </article>
  );
}

function ProfessionalOnlyCard({ professional }) {
  const images = getDemoImages(professional, 3);
  const [currentImage, setCurrentImage] = useState(0);

  const cost = getProfessionalCost(professional);

  return (
    <article className="project-card">
      <PostHeader professional={professional} />

      <ImageSlider
        images={images}
        currentImage={currentImage}
        nextImage={() =>
          setCurrentImage((currentImage + 1) % images.length)
        }
        previousImage={() =>
          setCurrentImage(
            currentImage === 0 ? images.length - 1 : currentImage - 1
          )
        }
        alt={`${professional.service || "Professional"} demo work`}
      />

      <div className="post-actions">
        <div className="left-actions">
          <button>♡</button>
          <button>♧</button>
          <button>↗</button>
        </div>
        <button>🔖</button>
      </div>

      <div className="post-content">
        <div className="title-cost-row">
          <h3>{professional.service || "Professional Service"}</h3>

          <div className="inline-cost">{formatCurrency(cost, professional)}</div>
        </div>

        <p className="description">
          {professional.experience || 0} years of experience in{" "}
          {professional.service || "professional services"}. Demo portfolio
          image and indicative cost shown until real work is uploaded.
        </p>

        <div className="project-details">
          <Detail
            icon="🛠️"
            label="Years Exp."
            value={professional.experience || 0}
          />
          <Detail
            icon="📁"
            label="Projects"
            value={`${professional.completed_projects || 0}+`}
          />
          <Detail
            icon="⭐"
            label="Rating"
            value={professional.rating || "New"}
          />
        </div>

        <div className="cost-box">
          <div>
            <small>Previous work cost</small>
            <strong>{formatCurrency(cost, professional)}</strong>
          </div>

          <span className="cost-note">Indicative cost</span>
        </div>

        <div className="post-footer">
          <span>📍 {professional.location}</span>
          <span>Recent work</span>
        </div>

        <CardButtons professional={professional} />
      </div>
    </article>
  );
}

function PostHeader({ professional }) {
  const [showMenu, setShowMenu] = useState(false);

  const copyProfile = async () => {
    const profileText = `${professional.name || "Professional"} - ${
      professional.service || "Professional Service"
    }`;

    try {
      await navigator.clipboard.writeText(profileText);
      alert("Profile copied!");
      setShowMenu(false);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const shareProfile = async () => {
    const shareData = {
      title: professional.name || "BuildConnect Professional",
      text: `${professional.name || "Professional"} - ${
        professional.service || "Professional Service"
      }`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Profile link copied!");
      }
    } catch (error) {
      console.error("Share cancelled:", error);
    }

    setShowMenu(false);
  };

  return (
    <div className="post-header">
      <div className="profile-avatar">
        {professional.name?.charAt(0)?.toUpperCase()}
      </div>

      <div className="profile-info">
        <div className="name-row">
          <strong>
            {professional.company_name || professional.name}
          </strong>

          {professional.is_verified && (
            <span className="verified">✓</span>
          )}
        </div>

        <div className="profile-meta">
          <span>
            {professional.provider_type === "contractor"
              ? "Contractor"
              : "Individual"}
          </span>

          <span>•</span>

          <span>⭐ {professional.rating || "New"}</span>

          <span>•</span>

          <span>{professional.location}</span>
        </div>
      </div>

      <div className="more-menu-wrapper"
      onMouseLeave={() => setShowMenu(false)}
      >
        <button
          className="more-btn"
          onClick={() => setShowMenu((prev) => !prev)}
        >
          •••
        </button>

        {showMenu && (
          <div className="more-menu">
            <button onClick={shareProfile}>
              ↗️ Share Profile
            </button>

            <button onClick={copyProfile}>
              📋 Copy Profile
            </button>

            <button
              onClick={() => {
                alert("Report feature coming soon.");
                setShowMenu(false);
              }}
            >
              🚩 Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
function ImageSlider({
  images,
  currentImage,
  nextImage,
  previousImage,
  alt,
}) {
  return (
    <div className="image-container">
      <img
        src={images[currentImage]}
        alt={alt}
        className="project-image"
      />

      <div className="image-count">
        {currentImage + 1} / {images.length}
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            className="image-arrow left"
            onClick={previousImage}
          >
            ‹
          </button>

          <button
            type="button"
            className="image-arrow right"
            onClick={nextImage}
          >
            ›
          </button>

          <div className="image-dots">
            {images.map((_, index) => (
              <span
                key={index}
                className={index === currentImage ? "dot active-dot" : "dot"}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Detail({ icon, label, value }) {
  return (
    <div className="detail">
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function CardButtons({ professional }) {
  const [showProfile, setShowProfile] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const phone = professional.phone || "";

  const copyNumber = async () => {
    if (!phone) return;

    try {
      await navigator.clipboard.writeText(phone);
      alert("Phone number copied!");
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <>
      <div className="card-buttons">

        <button
          className="profile-btn"
          onClick={() => setShowProfile(true)}
        >
          View Profile
        </button>

        <button
          className="contact-btn"
          onClick={() => setShowContact(true)}
        >
          Contact
        </button>

      </div>

      {showProfile && (
        <ProfileModal
          professional={professional}
          onClose={() => setShowProfile(false)}
        />
      )}

      {showContact && (
        <div
          className="contact-popup-overlay"
          onClick={() => setShowContact(false)}
        >
          <div
            className="contact-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="contact-popup-close"
              onClick={() => setShowContact(false)}
            >
              ×
            </button>

            <h3>Contact Professional</h3>

            <p className="contact-phone">
              📞 Phone:{" "}
              <strong>
                {phone || "Phone number not available"}
              </strong>
            </p>

            <div className="contact-popup-buttons">

              {phone && (
                <a
                  className="call-now-btn"
                  href={`tel:${phone}`}
                >
                  📞 Call Now
                </a>
              )}

              {phone && (
                <button
                  className="copy-number-btn"
                  onClick={copyNumber}
                >
                  📋 Copy Number
                </button>
              )}

            </div>

            {!phone && (
              <p className="no-phone">
                Phone number is not available.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function ProfileModal({ professional, onClose }) {
  const portfolio = professional.portfolio_images || [];
  const projects =
    professional.construction_projects || professional.projects || [];

  const portfolioImages = portfolio
    .map((item) => getImageUrl(typeof item === "string" ? item : item.image))
    .filter(Boolean);

  const projectImages = projects.flatMap((project) =>
    (project.images || [])
      .map((item) => getImageUrl(typeof item === "string" ? item : item.image))
      .filter(Boolean)
  );

  const images = [...new Set([...portfolioImages, ...projectImages])];
  const finalImages = images.length > 0 ? images : getDemoImages(professional, 3);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="profile-modal-overlay" onMouseDown={onClose}>
      <div
        className="profile-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="profile-modal-close" onClick={onClose}>
          ×
        </button>

        <div className="profile-modal-header">
          <div className="profile-modal-avatar">
            {professional.name?.charAt(0)?.toUpperCase()}
          </div>

          <div>
            <div className="profile-modal-name-row">
              <h2>{professional.company_name || professional.name}</h2>
              {professional.is_verified && (
                <span className="verified">✓</span>
              )}
            </div>

            <p>
              {professional.provider_type === "contractor"
                ? "Contractor"
                : "Individual Professional"}
              {professional.service ? ` • ${professional.service}` : ""}
              {professional.location ? ` • ${professional.location}` : ""}
            </p>
          </div>
        </div>

        <div className="profile-stats">
          <div>
            <strong>{professional.experience || 0}</strong>
            <span>Years</span>
          </div>
          <div>
            <strong>{professional.completed_projects || 0}+</strong>
            <span>Projects</span>
          </div>
          <div>
            <strong>⭐ {professional.rating || "New"}</strong>
            <span>Rating</span>
          </div>
        </div>

        <div className="profile-modal-actions">
          <a
            className="profile-contact-btn"
            href={professional.phone ? `tel:${professional.phone}` : "#"}
            onClick={(e) => {
              if (!professional.phone) e.preventDefault();
            }}
          >
            Contact Professional
          </a>
        </div>

        <div className="profile-posts-title">
          <span>WORK</span>
          <strong>{finalImages.length} posts</strong>
        </div>

        <div className="profile-post-grid">
          {finalImages.map((image, index) => (
            <div className="profile-post-item" key={`${image}-${index}`}>
              <img
                src={image}
                alt={`${professional.name || "Professional"} work ${index + 1}`}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) {
    return "Recently";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const now = new Date();

  const diff = Math.floor(
    (now - date) / (1000 * 60 * 60 * 24)
  );

  if (diff <= 0) {
    return "Today";
  }

  if (diff === 1) {
    return "1 day ago";
  }

  return `${diff} days ago`;
}

export default App;