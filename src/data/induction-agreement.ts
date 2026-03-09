// Confidentiality agreement clauses shown during induction registration.
// Extracted from InductionForm so legal text lives in data, not UI components.

export interface AgreementClause {
  number: string;
  text: string;
}

export interface AgreementSection {
  items: AgreementClause[];
}

export const INDUCTION_AGREEMENT_DATA: Record<string, AgreementSection> = {
  confidentialityAgreement: {
    items: [
      {
        number: "1",
        text: "SecureCash and yourself (hereinafter called both parties) shall keep confidential, all confidential information which is transferred or comes into its possession during the course of or pursuant to any employment, contract or association arising between both parties both before and after the acceptance date of this agreement.",
      },
      {
        number: "2",
        text: "Both parties shall ensure that their employees, agents and sub contractors observe the same obligation of confidentiality. This clause shall survive the termination or expiration of any request or contract associated with such request that occurs from the acceptance date of this agreement.",
      },
      {
        number: "3",
        text: "Both parties acknowledge that confidential information is of a special, unique and invaluable nature such that an award of damages or an account of profits would be inadequate to adequately compensate the other party to this agreement for unauthorised disclosure or use there of.",
      },
      {
        number: "4",
        text: "Both parties therefore acknowledge that the other party to this agreement has the right to seek and obtain an ex parte, interlocutory or final injunction to prohibit or restrain that party from any violation or threatened or suspected violation of any term of any contract, employment or association arising from this or future agreements and to produce the said contract as the contractors or sub contractors obligation under such contract as both parties irrevocable consent thereto.",
      },
      {
        number: "5",
        text: "Confidential information means all information belonging to each party which is confidential and commercially sensitive, including but not limited to information concerning the nature, location and capabilities of both parties clients, pricing structure, operating procedures, methods and strategies.",
      },
      {
        number: "6",
        text: "All details included in a contract arising from or in association with this agreement and all other information of a confidential nature concerning any aspect of both parties business activities.",
      },
    ],
  },
};
