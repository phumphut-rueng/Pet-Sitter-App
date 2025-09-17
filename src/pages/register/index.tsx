import { useState } from "react";
import ProgressBar from "@/components/progressStep/ProgressBar";
import ProgressStep from "@/components/progressStep/ProgressStep";
import RejectConfirmation from "../../components/modal/RejectConfirmation";

export default function register() {
  const [isOpenAlert, setisOpenAlert] = useState(false);

  return (
    <>
      <button
        onClick={() => { setisOpenAlert(true) }}
      >click</button>
      <RejectConfirmation
        open={isOpenAlert}
        onOpenChange={setisOpenAlert}
        onReject={() => { }}
      />
    </>
  );
}
