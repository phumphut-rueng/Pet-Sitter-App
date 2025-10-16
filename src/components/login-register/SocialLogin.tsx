import { signIn } from "next-auth/react";
import { useState } from "react";
import PrimaryButton from "../buttons/PrimaryButton";

interface SocialLoginProps {
    callbackUrl?: string;
    role?: number;
}

export default function SocialLogin({
    callbackUrl = "/admin",
    role,
}: SocialLoginProps) {
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleSocialLogin = async (provider: "google" | "facebook") => {
        try {
            setIsLoading(provider);

            // เพิ่ม role ใน callbackUrl ถ้ามี
            const finalCallbackUrl = role
                ? `${callbackUrl}?role=${role}`
                : callbackUrl;

            await signIn(provider, {
                callbackUrl: finalCallbackUrl,
                redirect: true,
            });
        } catch (error) {
            console.error(`Error signing in with ${provider}:`, error);
            setIsLoading(null);
        }
    };

    return (
        <>
            <div className="my-6 flex items-center">
                <div className="h-px flex-1 bg-gray-2" />
                <span className="mx-2 text-gray-6">
                    Or Continue With
                </span>
                <div className="h-px flex-1 bg-gray-2" />
            </div>

            <div className="flex max-[400px]:flex-col flex-row items-center gap-4 w-auto">
                {/* <PrimaryButton
                    text={isLoading === "facebook" ? "Loading..." : "Facebook"}
                    srcImage="/icons/fbIcon.svg"
                    bgColor="gray"
                    textColor="black"
                    className="w-full sm:max-w-[210px]"
                    onClick={() => handleSocialLogin("facebook")}
                    disabled={isLoading !== null}
                /> */}
                <PrimaryButton
                    text={isLoading === "google" ? "Loading..." : "Gmail"}
                    srcImage="/icons/gmaiIicon.svg"
                    bgColor="gray"
                    textColor="black"
                    className="w-full"
                    onClick={() => handleSocialLogin("google")}
                    disabled={isLoading !== null}
                />
            </div>

        </>
    )

}