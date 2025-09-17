import { useState } from "react";
import RejectConfirmation from "@/components/modal/RejectConfirmation";

export default function register() {
  const [isOpenAlert, setisOpenAlert] = useState(false);

  return (
    <>
      <button
        onClick={() => { setisOpenAlert(true) }}
      >
        Click!!!
      </button>

      {/* <BookingConfirmation open={isOpenAlert} onOpenChange={setisOpenAlert} /> */}
      <RejectConfirmation
        open={isOpenAlert}
        onOpenChange={setisOpenAlert}
        onReject={() => { }}
      />
    </>
  );
}
