import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Single from "./pages/Single";
import Write from "./pages/Write";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";
import ErrorPage from "./pages/Error";
import RegisterEditor from "./pages/Register-Editor";
import EditorPage from "./pages/Page-Editor";
import Profile from "./pages/Profile";
import SavedPosts from "./pages/SavedPosts"; 
import ViewedPosts from "./pages/ViewedPosts"
import AdminDashboard from "./pages/AdminDashboard";
import PostsDetail from "./pages/PostsDetail"; 
import "./style.scss";
import axios from "axios";

// Cấu hình Axios Global (Chuẩn)
axios.defaults.withCredentials = true;

const Layout = () => {
  return (
    <div className="layout-wrapper">
      <Navbar />
      <div className="main-content">
        <Outlet />
      </div>
      <Chatbot />
      <Footer />
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: "post/:id/stats", element: <PostsDetail /> },
      { path: "post/:id", element: <Single /> },
      { path: "write", element: <Write /> },
      { path: "editor", element: <EditorPage /> },
      
      // --- CHUYỂN 3 DÒNG NÀY VÀO ĐÂY ĐỂ CÓ NAVBAR & FOOTER ---
      { path: "profile", element: <Profile /> },
      { path: "saved-posts", element: <SavedPosts /> }, 
      { path: "viewed-posts", element: <ViewedPosts /> },
      // ------------------------------------------------------
    ],
  },
  // Các trang riêng biệt không cần Navbar/Footer thì để ngoài này
  { path: "/register", element: <Register />, errorElement: <ErrorPage /> },
  { path: "/login", element: <Login />, errorElement: <ErrorPage /> },
  { path: "/register-editor", element: <RegisterEditor />, errorElement: <ErrorPage /> },
  { path: "/admin", element: <AdminDashboard />, errorElement: <ErrorPage /> }, 
  { path: "*", element: <ErrorPage /> },
]);

function App() {
  return (
    <div className="app">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;