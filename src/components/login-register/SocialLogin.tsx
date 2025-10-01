import PrimaryButton from "../buttons/PrimaryButton";

export default function SocialLogin({

}) {
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
                <PrimaryButton
                    text="Facebook"
                    srcImage="/icons/fbIcon.svg"
                    bgColor="gray"
                    textColor="black"
                    className="w-full sm:max-w-[210px]"
                />
                <PrimaryButton
                    text="Gmail"
                    srcImage="/icons/gmaiIicon.svg"
                    bgColor="gray"
                    textColor="black"
                    className="w-full sm:max-w-[210px] "
                />
            </div>

        </>
    )

}