"use client";

import React, { useState } from "react";
import BookingModal from "./BookingModal";

export default function BookingModalTrigger({ buttonText = "Enquire Now", courseInterest = "", className = "primary-btn w-full justify-center" }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={className}>
        {buttonText}
      </button>
      <BookingModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        defaultInterest={courseInterest} 
      />
    </>
  );
}
