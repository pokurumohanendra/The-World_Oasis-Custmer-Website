"use client";

import { useFormState } from "react-dom";
import { updateGuest } from "../_lib/actions";
import SubmitButton from "./SubmitButton";

function UpdateProfileForm({ guest, children }) {
  const [state, formAction] = useFormState(updateGuest, null);

  const { fullName, email, nationalID } = guest;

  return (
    <form
      action={formAction}
      className="bg-primary-900 py-6 sm:py-8 px-4 sm:px-8 lg:px-12 text-base sm:text-lg flex gap-6 flex-col rounded-xl border border-primary-800 shadow-sm"
    >
      <div className="space-y-2">
        <label>Full name</label>
        <input
          disabled
          defaultValue={fullName}
          name="fullName"
          className="px-5 py-3 bg-stone-100 text-primary-100 border border-primary-800 w-full shadow-sm rounded-md disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-primary-400"
        />
      </div>

      <div className="space-y-2">
        <label>Email address</label>
        <input
          disabled
          defaultValue={email}
          name="email"
          className="px-5 py-3 bg-stone-100 text-primary-100 border border-primary-800 w-full shadow-sm rounded-md disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-primary-400"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="nationality">Where are you from?</label>

        {children}
      </div>

      <div className="space-y-2">
        <label htmlFor="nationalID">National ID number</label>
        <input
          defaultValue={nationalID}
          name="nationalID"
          minLength={6}
          maxLength={12}
          pattern="[a-zA-Z0-9]{6,12}"
          required
          className="px-5 py-3 bg-stone-100 text-primary-100 border border-primary-800 w-full shadow-sm rounded-md"
        />
      </div>

      {state?.message && (
        <p
          role="status"
          className={state.ok ? "text-green-400" : "text-red-400"}
        >
          {state.message}
        </p>
      )}

      <div className="flex justify-end items-center gap-6">
        <SubmitButton pendingLabel="Updating...">Update profile</SubmitButton>
      </div>
    </form>
  );
}

export default UpdateProfileForm;
