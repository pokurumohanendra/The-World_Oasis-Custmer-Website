import { getCountries } from "@/app/_lib/data-service";

async function SelectCountry({ defaultCountry, name, id, className }) {
  const countries = await getCountries();
  const flag =
    countries.find((country) => country.name === defaultCountry)?.flag ?? "";

  return (
    <>
      {flag && (
        <img
          src={flag}
          alt={`${defaultCountry} flag`}
          className="mb-2 h-5 rounded-sm"
        />
      )}

      <select
        name={name}
        id={id}
        defaultValue={defaultCountry ? `${defaultCountry}%${flag}` : ""}
        className={className}
        required
      >
        <option value="">Select country...</option>
        {countries.map((c) => (
          <option key={c.code || c.name} value={`${c.name}%${c.flag}`}>
            {c.name}
          </option>
        ))}
      </select>
    </>
  );
}

export default SelectCountry;
