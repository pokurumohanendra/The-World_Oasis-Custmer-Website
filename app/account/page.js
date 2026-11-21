import { auth } from "../_lib/auth";
import { getBookings, getGuest } from "../_lib/data-service";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";

export const metadata = {
  title: "Guest area",
};

export default async function Page() {
  const session = await auth();
  const [guest, bookings] = await Promise.all([
    getGuest(session.user.email),
    getBookings(session.user.guestId),
  ]);

  const firstName = session.user.name?.split(" ").at(0) || "Guest";
  const now = new Date();
  const upcomingBookings = bookings
    .filter((booking) => new Date(booking.endDate) >= now)
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  const nextBooking = upcomingBookings.at(0);
  const pastStays = bookings.filter(
    (booking) => new Date(booking.endDate) < now
  );
  const totalNights = bookings.reduce(
    (total, booking) => total + (booking.numNights || 0),
    0
  );
  const profileFields = [guest?.fullName, guest?.email, guest?.nationality, guest?.nationalID];
  const completedFields = profileFields.filter(Boolean).length;
  const profilePercent = Math.round(
    (completedFields / profileFields.length) * 100
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-semibold text-2xl text-accent-400 mb-2">
          Welcome, {firstName}
        </h2>
        <p className="text-primary-200">
          Here is an overview of your stays at The Wild Oasis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardStat label="Total reservations" value={bookings.length} />
        <DashboardStat label="Upcoming stays" value={upcomingBookings.length} />
        <DashboardStat label="Nights reserved" value={totalNights} />
      </div>

      {nextBooking ? (
        <section className="border border-primary-800 bg-primary-900 px-6 py-5 rounded-xl shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-primary-400 mb-1">
                Your next stay
              </p>
              <h3 className="text-xl font-semibold text-accent-400">
                Cabin {nextBooking.cabins.name}
              </h3>
              <p className="text-primary-200 mt-2">
                {format(new Date(nextBooking.startDate), "EEEE, MMMM d, yyyy")} —{" "}
                {format(new Date(nextBooking.endDate), "EEEE, MMMM d, yyyy")}
              </p>
              <p className="text-primary-400 mt-1">
                {nextBooking.numNights} nights · {nextBooking.numGuests} guest
                {nextBooking.numGuests !== 1 && "s"} · Reservation #{nextBooking.id}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-xl font-semibold text-accent-400">
                ${nextBooking.totalPrice}
              </p>
              <p className="text-sm text-primary-400 mt-1">
                Starts {formatDistanceToNow(new Date(nextBooking.startDate), { addSuffix: true })}
              </p>
            </div>
          </div>
          <Link
            href="/account/reservations"
            className="inline-block mt-5 text-accent-400 underline hover:text-accent-300"
          >
            View reservation details &rarr;
          </Link>
        </section>
      ) : (
        <section className="border border-primary-800 bg-white px-6 py-5 rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold mb-2">Plan your next escape</h3>
          <p className="text-primary-300 mb-4">
            You do not have an upcoming stay. Explore our cabins and reserve your favorite.
          </p>
          <Link href="/cabins" className="text-accent-400 underline">
            Browse luxury cabins &rarr;
          </Link>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <section className="border border-primary-800 bg-white px-6 py-5 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Guest profile</h3>
            <span className="text-accent-400 font-semibold">{profilePercent}%</span>
          </div>
          <div className="h-2 bg-primary-800 mb-4">
            <div
              className="h-full bg-accent-500"
              style={{ width: `${profilePercent}%` }}
            />
          </div>
          <p className="text-primary-300 mb-3">
            Complete your nationality and national ID to make check-in faster.
          </p>
          <Link href="/account/profile" className="text-accent-400 underline">
            Review your profile &rarr;
          </Link>
        </section>

        <section className="border border-primary-800 bg-white px-6 py-5 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Your stay history</h3>
          <p className="text-3xl font-semibold text-accent-400 mb-2">
            {pastStays.length}
          </p>
          <p className="text-primary-300 mb-3">
            completed stay{pastStays.length !== 1 && "s"} with The Wild Oasis.
          </p>
          <Link href="/account/reservations" className="text-accent-400 underline">
            See all reservations &rarr;
          </Link>
        </section>
      </div>
    </div>
  );
}

function DashboardStat({ label, value }) {
  return (
    <div className="border border-primary-800 bg-primary-900 px-5 py-4 rounded-xl shadow-sm">
      <p className="text-3xl font-semibold text-accent-400">{value}</p>
      <p className="text-sm uppercase tracking-wide text-primary-400 mt-1">
        {label}
      </p>
    </div>
  );
}
