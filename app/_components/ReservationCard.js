import Link from "next/link";
import Image from "next/image";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { format, formatDistance, isPast, isToday, parseISO } from "date-fns";
import DeleteReservation from "./DeleteReservation";

export const formatDistanceFromNow = (dateStr) =>
  formatDistance(parseISO(dateStr), new Date(), {
    addSuffix: true,
  }).replace("about ", "");

function ReservationCard({ booking, onDelete }) {
  const {
    id,
    guestId,
    startDate,
    endDate,
    numNights,
    totalPrice,
    numGuests,
    status,
    isPaid,
    hasBreakfast,
    created_at,
    cabins: { name, image },
  } = booking;

  return (
    <div className="flex flex-col sm:flex-row border border-primary-800 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="relative h-48 sm:h-auto sm:min-h-40 sm:w-40 shrink-0">
        <Image
          src={image}
          alt={`Cabin ${name}`}
          fill
          className="object-cover border-b sm:border-b-0 sm:border-r border-primary-800"
        />
      </div>

      <div className="flex-grow px-4 sm:px-6 py-4 sm:py-3 flex flex-col min-w-0">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <h3 className="text-lg sm:text-xl font-semibold">
            {numNights} nights in Cabin {name}
          </h3>
          {isPast(new Date(endDate)) ? (
            <span className="bg-yellow-800 text-yellow-200 h-7 px-3 uppercase text-xs font-bold flex items-center rounded-sm">
              past
            </span>
          ) : (
            <span className="bg-green-800 text-green-200 h-7 px-3 uppercase text-xs font-bold flex items-center rounded-sm">
              upcoming
            </span>
          )}
        </div>

        <p className="text-base sm:text-lg text-primary-300 mt-1">
          {format(new Date(startDate), "EEE, MMM dd yyyy")} (
          {isToday(new Date(startDate))
            ? "Today"
            : formatDistanceFromNow(startDate)}
          ) &mdash; {format(new Date(endDate), "EEE, MMM dd yyyy")}
        </p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-primary-400">
          <span>Reservation #{id}</span>
          <span className="capitalize">Status: {status || "unconfirmed"}</span>
          <span>{isPaid ? "Paid" : "Payment pending"}</span>
          <span>{hasBreakfast ? "Breakfast included" : "Breakfast not included"}</span>
        </div>

        <div className="flex flex-wrap gap-3 sm:gap-5 mt-4 sm:mt-auto items-baseline">
          <p className="text-xl font-semibold text-accent-400">${totalPrice}</p>
          <p className="text-primary-300">&bull;</p>
          <p className="text-lg text-primary-300">
            {numGuests} guest{numGuests > 1 && "s"}
          </p>
          <p className="w-full lg:w-auto lg:ml-auto text-sm text-primary-400">
            Booked {format(new Date(created_at), "EEE, MMM dd yyyy, p")}
          </p>
        </div>
      </div>

      <div className="flex sm:flex-col border-t sm:border-t-0 sm:border-l border-primary-800 sm:w-[100px] min-h-14">
        {!isPast(new Date(endDate)) ? (
          <>
            <Link
              href={`/account/reservations/edit/${id}`}
              className="group flex items-center justify-center gap-2 uppercase text-xs font-bold text-primary-300 border-r sm:border-r-0 sm:border-b border-primary-800 flex-grow px-3 py-3 hover:bg-accent-600 transition-colors hover:text-primary-100"
            >
              <PencilSquareIcon className="h-5 w-5 text-primary-600 group-hover:text-primary-100 transition-colors" />
              <span className="mt-1">Edit</span>
            </Link>
            <DeleteReservation bookingId={id} onDelete={onDelete} />
          </>
        ) : null}
      </div>
    </div>
  );
}

export default ReservationCard;
