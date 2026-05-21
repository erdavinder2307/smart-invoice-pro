const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
const normalizePhone = (value) => String(value || "").replace(/\D/g, "");
const normalizeGstin = (value) => String(value || "").trim().toUpperCase();

const buildCandidateIdentity = (customer = {}) => ({
  email: normalizeEmail(customer.email),
  phones: [customer.phone, customer.mobile].map(normalizePhone).filter(Boolean),
  gstin: normalizeGstin(customer.gst_number),
});

export const findDuplicateCustomer = (customers = [], candidate = {}, currentCustomerId = null) => {
  const candidateIdentity = buildCandidateIdentity(candidate);

  return customers.find((customer) => {
    if (!customer || customer.id === currentCustomerId) return false;
    const existingIdentity = buildCandidateIdentity(customer);

    if (candidateIdentity.email && candidateIdentity.email === existingIdentity.email) {
      return true;
    }

    if (
      candidateIdentity.phones.length > 0
      && candidateIdentity.phones.some((phone) => existingIdentity.phones.includes(phone))
    ) {
      return true;
    }

    if (candidateIdentity.gstin && candidateIdentity.gstin === existingIdentity.gstin) {
      return true;
    }

    return false;
  }) || null;
};

export const getDuplicateFieldLabel = (customers = [], candidate = {}, currentCustomerId = null) => {
  const duplicate = customers.find((customer) => {
    if (!customer || customer.id === currentCustomerId) return false;
    const existingIdentity = buildCandidateIdentity(customer);
    const candidateIdentity = buildCandidateIdentity(candidate);

    return Boolean(
      (candidateIdentity.email && candidateIdentity.email === existingIdentity.email)
      || (
        candidateIdentity.phones.length > 0
        && candidateIdentity.phones.some((phone) => existingIdentity.phones.includes(phone))
      )
      || (candidateIdentity.gstin && candidateIdentity.gstin === existingIdentity.gstin)
    );
  });

  if (!duplicate) return "";

  const candidateIdentity = buildCandidateIdentity(candidate);
  const existingIdentity = buildCandidateIdentity(duplicate);

  if (candidateIdentity.email && candidateIdentity.email === existingIdentity.email) return "email";
  if (candidateIdentity.phones.some((phone) => existingIdentity.phones.includes(phone))) return "phone";
  if (candidateIdentity.gstin && candidateIdentity.gstin === existingIdentity.gstin) return "GSTIN";
  return "record";
};

export const dedupeCustomers = (customers = []) => {
  // Exclude archived customers — they have been intentionally merged/removed
  const activeCustomers = customers.filter(
    (c) => !c.status || c.status.toUpperCase() !== 'ARCHIVED'
  );

  const keyOwner = new Map(); // key → canonical customer
  const uniqueCustomers = [];
  let duplicateCount = 0;
  const duplicateRecords = [];

  activeCustomers.forEach((customer) => {
    const { email, phones, gstin } = buildCandidateIdentity(customer);
    const keys = [
      email ? `email:${email}` : null,
      ...phones.map((phone) => `phone:${phone}`),
      gstin ? `gstin:${gstin}` : null,
    ].filter(Boolean);

    const matchKey = keys.find((key) => keyOwner.has(key));
    if (keys.length > 0 && matchKey) {
      duplicateCount += 1;
      duplicateRecords.push({ ...customer, matchedWith: keyOwner.get(matchKey) });
      return;
    }

    keys.forEach((key) => keyOwner.set(key, customer));
    uniqueCustomers.push(customer);
  });

  return { uniqueCustomers, duplicateCount, duplicateRecords };
};
