import { cn } from "@/lib/utils/utils";

export const Section = ({
    title,
    cols = 1,
    children
}: {
    title: string;
    cols?: number;
    children: React.ReactNode;
}) => (
    <div className="space-y-3">
        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-orange-2"></div>
            </div>
            <div className="relative flex justify-center  ">
                <h2 className="bg-white px-3 py-2 text-2xl font-bold text-orange-5">
                    {title}
                </h2>
            </div>
        </div>
        <div className={cn("grid gap-3", `sm:grid-cols-${cols}`)}>{children}</div>
    </div>
);

export const SubSection = ({
    title,
    children
}: {
    title: string;
    children: React.ReactNode;
}) => (
    <div className="group relative p-6 rounded-2xl border-2 border-orange-200 shadow-md 
    hover:shadow-xl transition-all duration-300 hover:border-orange-400">
        <div className="absolute -top-3 left-6 bg-white px-4 py-1 rounded-full border-2 shadow-sm">
            <p className="text-sm font-bold text-orange-600">{title}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-2">{children}</div>
    </div>
);