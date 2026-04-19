import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Signup from "./pages/Signup.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import CreateProject from "./pages/CreateProject.tsx";
import AuthorDashboard from "./pages/AuthorDashboard.tsx";
import UserDashboard from "./pages/UserDashboard.tsx";
import ApprovalDashboard from "./pages/ApprovalDashboard.tsx";
import CreateUser from "./pages/CreateUser.tsx";
import AddUser from "./pages/AddUser.tsx";
import ManageUser from "./pages/ManageUser.tsx";
import EditUser from "./pages/EditUser.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/create-project" element={<CreateProject />} />
          <Route path="/author-dashboard" element={<AuthorDashboard />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/approval-dashboard" element={<ApprovalDashboard />} />
          <Route path="/create-user" element={<CreateUser />} />
          <Route path="/add-user" element={<AddUser />} />
          <Route path="/manage-user" element={<ManageUser />} />
          <Route path="/edit-user" element={<EditUser />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
