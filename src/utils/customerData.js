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
  const seen = new Set();
  const uniqueCustomers = [];
  let duplicateCount = 0;

  customers.forEach((customer) => {
    const { email, phones, gstin } = buildCandidateIdentity(customer);
    const keys = [
      email ? `email:${email}` : null,
      ...phones.map((phone) => `phone:${phone}`),
      gstin ? `gstin:${gstin}` : null,
    ].filter(Boolean);

    if (keys.length > 0 && keys.some((key) => seen.has(key))) {
      duplicateCount += 1;
      return;
    }

    keys.forEach((key) => seen.add(key));
    uniqueCustomers.push(customer);
  });

  return { uniqueCustomers, duplicateCount };
};
