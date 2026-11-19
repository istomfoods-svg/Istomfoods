import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Account from './pages/Account'
import Board from './pages/Board'
import Admin from './pages/Admin'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Contact from './pages/Contact'
import Home from './pages/Home'
import MyOrders from './pages/MyOrders'
import PaymentComplete from './pages/PaymentComplete'
import Shop from './pages/Shop'
import StudentBites from './pages/StudentBites'
import Transfer from './pages/Transfer'

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
        <Route path="board" element={<Board />} />
        <Route path="admin" element={<Admin />} />
        <Route path="transfer" element={<Transfer />} />
        <Route path="account" element={<Account />} />
        <Route path="my-orders" element={<MyOrders />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
