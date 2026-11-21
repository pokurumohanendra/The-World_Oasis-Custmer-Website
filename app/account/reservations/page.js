import ReservationList from "@/app/_components/ReservationList";
import { auth } from "@/app/_lib/auth";
import { getBookings } from "@/app/_lib/data-service";

export const metadata = {
  title: "Reservations",
};

export default async function Page() {
  const session = await auth();
  const bookings = await getBookings(session.user.guestId);
  const now = new Date();
  const upcomingCount = bookings.filter(
    (booking) => new Date(booking.endDate) >= now
  ).length;
  const pastCount = bookings.length - upcomingCount;
  const totalNights = bookings.reduce(
    (total, booking) => total + (booking.numNights || 0),
    0
  );

  return (
    <div>
      <h2 className="font-semibold text-2xl text-accent-400 mb-7">
        Your reservations
      </h2>

      {bookings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-7">
          <ReservationStat label="Upcoming" value={upcomingCount} />
          <ReservationStat label="Past stays" value={pastCount} />
          <ReservationStat label="Total nights" value={totalNights} />
        </div>
      )}

      {bookings.length === 0 ? (
        <p className="text-lg">
          You have no reservations yet. Check out our{" "}
          <a className="underline text-accent-400" href="/cabins">
            luxury cabins &rarr;
          </a>
        </p>
      ) : (
        <ReservationList bookings={bookings} />
      )}
    </div>
  );
}

function ReservationStat({ label, value }) {
  return (
    <div className="border border-primary-800 bg-primary-900 px-5 py-4 rounded-lg shadow-sm">
      <p className="text-2xl font-semibold text-accent-400">{value}</p>
      <p className="text-sm text-primary-400 uppercase tracking-wide">{label}</p>
    </div>
  );
}
