import {
    AlertDialogDescription,
  } from "@/components/ui/alert-dialog";
  import AlertConfirm from "./AlertConfirm";
  import PrimaryButton from "../buttons/PrimaryButton";
  import { useState } from "react";

  
  interface ReportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: { issue: string; description: string }) => void;
  }
  
  export default function ReportDialog({
    open,
    onOpenChange,
    onSubmit,
  }: ReportDialogProps) {
    const [issue, setIssue] = useState("");
    const [description, setDescription] = useState("");
  
    return (
      <AlertConfirm
        open={open}
        onOpenChange={onOpenChange}
        width={700}
        maxWidth="90vh"
        title="Report"
        description={
          <AlertDialogDescription asChild>
            <div className="pl-5 pr-4 pb-4 text-[16px] font-[500]">
              {/* Issue */}
              <div className="mb-10 mt-3">
                <label className="block text-black font-[600] mb-2">
                  Issue
                </label>
                <input
                  type="text"
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  placeholder="Subject"
                  className="w-full border border-gray-2 rounded-md p-3 text-[16px] leading-[22px] placeholder:text-gray-5 focus:outline-none focus:ring-0"
                />
              </div>
  
              {/* Description */}
              <div className="mb-40">
                <label className="block text-black font-[600] mb-2">
                  Description
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe detail..."
                  className="w-full border border-gray-2 rounded-md p-3 text-[16px] leading-[22px] placeholder:text-gray-5 focus:outline-none focus:ring-0"
                />
              </div>
  
              {/* Actions */}
              <div className="flex justify-between gap-4 mt-8">
                <PrimaryButton
                  text="Cancel"
                  bgColor="secondary"
                  textColor="orange"
                  type="button"
                  onClick={() => onOpenChange(false)}
                />
                <PrimaryButton
                  text="Send Report"
                  bgColor="primary"
                  textColor="white"
                  type="button"
                  onClick={() => {
                    onSubmit({ issue, description });
                    onOpenChange(false);
                  }}
                  disabled={issue === "" }
                />
              </div>
            </div>
          </AlertDialogDescription>
        }
      />
    );
  }
  