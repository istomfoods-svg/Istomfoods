import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Contact from './pages/Contact'
import Home from './pages/Home'
import MyOrders from './pages/MyOrders'
import PaymentComplete from './pages/PaymentComplete'
import Shop from './pages/Shop'
import StudentBites from './pages/StudentBites'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="student-bites" element={<StudentBites />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="payment-complete" element={<PaymentComplete />} />
        <Route path="my-orders" element={<MyOrders />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
