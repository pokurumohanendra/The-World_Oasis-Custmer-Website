import { notFound } from "next/navigation";
import { eachDayOfInterval } from "date-fns";
import { supabase } from "./supabase";

function normalizeGuest(guest) {
  if (!guest) return guest;
  return {
    ...guest,
    fullName: guest.fullName ?? guest.fullname,
    nationality: guest.nationality ?? guest.natinality,
  };
}

function normalizeBooking(booking) {
  if (!booking) return booking;
  return {
    ...booking,
    startDate: booking.startDate ?? booking.start,
    cabins: booking.cabins ?? booking.Cabins,
  };
}

export async function getCabin(id) {
  const { data, error } = await supabase
    .from("Cabins")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    notFound();
  }

  return data;
}

export async function getCabinPrice(id) {
  const { data, error } = await supabase
    .from("Cabins")
    .select("regularPrice, discount")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
  }

  return data;
}

export const getCabins = async function () {
  const { data, error } = await supabase
    .from("Cabins")
    .select("id, name, maxCapacity, regularPrice, discount, image")
    .order("name");

  if (error) {
    console.error(error);
    throw new Error("Cabins could not be loaded");
  }

  return data;
};

export async function getGuest(email) {
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("email", email)
    .single();

  return normalizeGuest(data);
}

export async function getBooking(id) {
  const { data, error, count } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    throw new Error("Booking could not get loaded");
  }

  return normalizeBooking(data);
}

export async function getBookings(guestId) {
  const { data, error, count } = await supabase
    .from("bookings")
    .select(
      "id, created_at, start, endDate, numNights, numGuests, totalPrice, guestId, cabinId, status, isPaid, hasBreakfast, observations, Cabins(name, image)"
    )
    .eq("guestId", guestId)
    .order("start");

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }

  return data.map(normalizeBooking);
}

export async function getBookedDatesByCabinId(cabinId) {
  let today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  today = today.toISOString();

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("cabinId", cabinId)
    .or(`start.gte.${today},status.eq.checked-in`);

  if (error) {
    console.error(error);
    throw new Error("Bookings could not get loaded");
  }

  const bookedDates = data.map(normalizeBooking)
    .map((booking) => {
      return eachDayOfInterval({
        start: new Date(booking.startDate),
        end: new Date(booking.endDate),
      });
    })
    .flat();

  return bookedDates;
}

export async function getSettings() {
  const { data, error } = await supabase.from("settings").select("*").single();

  if (error) {
    console.error(error);
    throw new Error("Settings could not be loaded");
  }

  return data;
}

export async function getCountries() {
  const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
  const regionCodes = (
    "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW"
  ).split(" ");

  return regionCodes
    .map((code) => ({
      code,
      name: regionNames.of(code),
      flag: `https://flagcdn.com/${code.toLowerCase()}.svg`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function createGuest(newGuest) {
  const databaseGuest = {
    ...newGuest,
    fullname: newGuest.fullName,
    natinality: newGuest.nationality,
  };
  delete databaseGuest.fullName;
  delete databaseGuest.nationality;
  const { data, error } = await supabase.from("guests").insert([databaseGuest]).select().single();

  if (error) {
    console.error(error);
    throw new Error("Guest could not be created");
  }

  return normalizeGuest(data);
}
