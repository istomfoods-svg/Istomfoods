import { useSettings } from '../context/SettingsContext'
import { waLink } from '../lib/format'

export default function Contact() {
  const { whatsapp, deliveryArea } = useSettings()
  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-3xl font-bold">Contact</h1>
      <p className="mt-2 text-neutral-700">Questions about an order or delivery? Message us on WhatsApp and we will reply.</p>
      <a href={waLink(whatsapp, 'Hello Istom Foods, I have a question.')} target="_blank" rel="noreferrer" className="btn mt-6 w-full bg-green-600 text-lg text-white hover:bg-green-700">Chat on WhatsApp</a>
      <div className="mt-8 rounded-2xl bg-brand-soft p-4">
        <p className="font-bold">Where we are</p>
        <p>Ado-Ekiti, Ekiti State, Nigeria</p>
        <p className="mt-2 font-bold">We deliver to</p>
        <p>{deliveryArea}</p>
      </div>
    </div>
  )
}
