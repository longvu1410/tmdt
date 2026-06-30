import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import CourseDetail from './pages/CourseDetail';
import Cart from './pages/Cart';
import Dashboard from './pages/Dashboard';
import EntryTest from './pages/EntryTest';
import PrivateMessage from './pages/PrivateMessage';
import VideoLearning from './pages/VideoLearning';
import VerifyEmail from './pages/VerifyEmail';
import CreateCourse from './pages/CreateCourse';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import TeacherRevenue from './pages/TeacherRevenue';
import TeacherCourses from './pages/TeacherCourses';
import EditCourse from './pages/EditCourse';
import CoursesPage from './pages/CoursesPage';
import MyComplaints from './pages/MyComplaints';
import ChatPage from './pages/ChatPage';
import Profile from './pages/Profile';
import ResetPassword from './pages/ResetPassword';
import TeacherComments from './pages/TeacherComments';
import TeacherVouchers from './pages/TeacherVouchers';


function App() {
  return (
    <Router>
      <div className="app-shell">
        <Navbar />
        <Routes>
          {/* Full-width routes (no padding container) */}
          <Route path="/learn/:courseId" element={<VideoLearning />} />

          {/* Padded/centered routes */}
          <Route path="/*" element={
            <main className="app-main">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/complaints" element={<MyComplaints />} />
                <Route path="/messages" element={<ChatPage />} />

                <Route path="/course/:id" element={<CourseDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/test/:courseId" element={<EntryTest />} />
                <Route path="/message/:teacherId" element={<PrivateMessage />} />
                <Route path="/api/auth/verify-email" element={<VerifyEmail />} />
                <Route path="/create-course" element={<CreateCourse />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/revenue" element={<TeacherRevenue />} />
                <Route path="/teacher/courses" element={<TeacherCourses />} />
                <Route path="/teacher/comments" element={<TeacherComments />} />
                <Route path="/teacher/vouchers" element={<TeacherVouchers />} />
                <Route path="/teacher/edit-course/:id" element={<EditCourse />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              </Routes>
            </main>
          } />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
