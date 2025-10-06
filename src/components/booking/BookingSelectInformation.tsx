import { useBookingForm } from "@/hooks/useBookingForm"
import InputText from "../input/InputText";
import InputTextArea from "../input/InputTextArea";
import PrimaryButton from "../buttons/PrimaryButton";

export default function BookingInformation() {
    const {
        form,
        error,
        handleChange,
        handlePhoneChange,
    } = useBookingForm();

    return (
        <form className="mt-6 space-y-6">
            {/* Name */}
            <InputText
                label="Your Name*"
                id="name"
                name="name"
                value={form.name}
                placeholder="Full name"
                type="text"
                variant={!error.name ? "default" : "error"}
                onChange={handleChange}
                errorText={error.name}
            />

            {/* Email + Phone */}
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                    <InputText
                        label="Email*"
                        id="email"
                        name="email"
                        value={form.email}
                        placeholder="email@company.com"
                        type="text"
                        variant={!error.email ? "default" : "error"}
                        onChange={handleChange}
                        errorText={error.email}
                    />
                </div>
                <div className="flex-1">
                    <InputText
                        label="Phone*"
                        id="phone"
                        name="phone"
                        value={form.phone}
                        placeholder="xxx-xxx-xxxx"
                        type="text"
                        variant={!error.phone ? "default" : "error"}
                        inputMode="numeric"
                        onChange={handlePhoneChange}
                        errorText={error.phone}
                    />
                </div>
            </div>

            {/* Additional Message */}
            <InputTextArea
                label="Additional Message (To pet sitter)"
                id="message"
                name="message"
                value={form.addition}
                onChange={() => { }}
            />
        </form>
    )
}
