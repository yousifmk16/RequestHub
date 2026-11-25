import type { Category, Priority, Status } from "../src/generated/prisma/enums";

export type SeedRequest = {
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
  /** How long ago the request was created, in hours. */
  ageHours: number;
};

/**
 * Realistic demo data spread over ~6 weeks, across every category, priority and
 * status, so the list, filters and dashboard are meaningful on first run.
 */
export const SEED_REQUESTS: SeedRequest[] = [
  {
    title: "VPN drops every hour on office Wi-Fi",
    description:
      "Since Monday my VPN disconnects roughly every 60 minutes when I'm on the office Wi-Fi. Wired connection is fine. I have to re-enter my credentials each time.",
    category: "IT",
    priority: "HIGH",
    status: "NEW",
    ageHours: 2,
  },
  {
    title: "Update emergency contact details",
    description:
      "I've moved house and need to change my emergency contact to my sister. Please let me know if a form needs signing.",
    category: "HR",
    priority: "LOW",
    status: "NEW",
    ageHours: 5,
  },
  {
    title: "Meeting room B projector not turning on",
    description:
      "The projector in meeting room B shows a red light and won't power on. We have a client presentation there on Thursday morning.",
    category: "ADMINISTRATION",
    priority: "HIGH",
    status: "IN_PROGRESS",
    ageHours: 9,
  },
  {
    title: "Access to the finance shared drive",
    description:
      "I joined the budgeting working group and need read access to the Finance/Planning shared drive. My manager has approved this by email.",
    category: "IT",
    priority: "MEDIUM",
    status: "NEW",
    ageHours: 20,
  },
  {
    title: "Parking permit for new car",
    description:
      "I changed my car last week. Please update my parking permit to the new plate number so I don't get flagged at the gate.",
    category: "OTHER",
    priority: "LOW",
    status: "NEW",
    ageHours: 26,
  },
  {
    title: "Laptop battery swelling",
    description:
      "My laptop's trackpad has started lifting and the case is bulging near the battery. I've stopped charging it. Need a replacement urgently.",
    category: "IT",
    priority: "HIGH",
    status: "IN_PROGRESS",
    ageHours: 30,
  },
  {
    title: "Annual leave balance looks wrong",
    description:
      "The portal shows 8 days of annual leave remaining but by my count I should have 13. I carried over 5 days from last year.",
    category: "HR",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    ageHours: 46,
  },
  {
    title: "Order ergonomic chair",
    description:
      "Following my workstation assessment, the occupational health report recommends an ergonomic chair with lumbar support. Report is in my HR file.",
    category: "ADMINISTRATION",
    priority: "MEDIUM",
    status: "NEW",
    ageHours: 52,
  },
  {
    title: "Outlook calendar not syncing on phone",
    description:
      "Meetings I accept on my laptop don't appear in the Outlook app on my phone. Signing out and back in didn't help.",
    category: "IT",
    priority: "LOW",
    status: "COMPLETED",
    ageHours: 70,
  },
  {
    title: "Request for salary certificate",
    description:
      "I need a salary certificate addressed to my bank for a mortgage application, ideally by the end of next week.",
    category: "HR",
    priority: "MEDIUM",
    status: "COMPLETED",
    ageHours: 75,
  },
  {
    title: "Kitchen fridge on 2nd floor leaking",
    description:
      "There is water pooling under the fridge in the 2nd floor kitchen. Someone could slip; I've put a sign up for now.",
    category: "ADMINISTRATION",
    priority: "HIGH",
    status: "COMPLETED",
    ageHours: 96,
  },
  {
    title: "Install Figma desktop app",
    description:
      "I need the Figma desktop app for the redesign project. The installer asks for admin rights I don't have.",
    category: "IT",
    priority: "LOW",
    status: "COMPLETED",
    ageHours: 110,
  },
  {
    title: "Book venue for team offsite",
    description:
      "Looking for a venue for 25 people on the 14th of next month, with a projector and lunch included. Budget has been approved.",
    category: "ADMINISTRATION",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    ageHours: 130,
  },
  {
    title: "Remote work arrangement",
    description:
      "I'd like to discuss working remotely two days a week from next quarter. What is the process and who needs to approve?",
    category: "HR",
    priority: "LOW",
    status: "IN_PROGRESS",
    ageHours: 150,
  },
  {
    title: "Phishing email received",
    description:
      "I received an email pretending to be from IT asking me to reset my password via an external link. I did not click it and forwarded it to security.",
    category: "IT",
    priority: "HIGH",
    status: "COMPLETED",
    ageHours: 170,
  },
  {
    title: "Business cards reprint",
    description:
      "My job title changed to Senior Analyst. I need 200 new business cards with the updated title.",
    category: "ADMINISTRATION",
    priority: "LOW",
    status: "COMPLETED",
    ageHours: 200,
  },
  {
    title: "Second monitor for design team",
    description:
      "Two designers on the team are working on a single screen. Requesting two 27-inch monitors with USB-C.",
    category: "IT",
    priority: "MEDIUM",
    status: "NEW",
    ageHours: 230,
  },
  {
    title: "Training budget for certification",
    description:
      "I'd like to take the AWS Solutions Architect certification. Requesting approval for the exam fee and two days of study leave.",
    category: "HR",
    priority: "MEDIUM",
    status: "NEW",
    ageHours: 260,
  },
  {
    title: "Lost access badge",
    description:
      "I lost my access badge on the way home yesterday. Please deactivate it and issue a replacement.",
    category: "OTHER",
    priority: "HIGH",
    status: "COMPLETED",
    ageHours: 300,
  },
  {
    title: "Air conditioning too cold in open office",
    description:
      "The open office area near the windows is consistently around 18°C. Several of us are wearing jackets at our desks.",
    category: "ADMINISTRATION",
    priority: "LOW",
    status: "NEW",
    ageHours: 330,
  },
  {
    title: "Shared mailbox for support team",
    description:
      "Please create a shared support mailbox for the customer support team and give access to the five team members.",
    category: "IT",
    priority: "MEDIUM",
    status: "COMPLETED",
    ageHours: 380,
  },
  {
    title: "Correct name spelling in HR system",
    description:
      "My surname is misspelled in the HR system and on my payslip. I can provide a passport copy to confirm the correct spelling.",
    category: "HR",
    priority: "MEDIUM",
    status: "COMPLETED",
    ageHours: 420,
  },
  {
    title: "Gym membership reimbursement",
    description:
      "Submitting my quarterly gym membership receipt for reimbursement under the wellness programme.",
    category: "OTHER",
    priority: "LOW",
    status: "IN_PROGRESS",
    ageHours: 470,
  },
  {
    title: "Software licence for Tableau",
    description:
      "Our team's Tableau licence expires at the end of the month. Requesting renewal for three users before reports stop refreshing.",
    category: "IT",
    priority: "HIGH",
    status: "NEW",
    ageHours: 520,
  },
  {
    title: "New joiner onboarding pack",
    description:
      "We have two new joiners starting on the 3rd. Please prepare laptops, badges and welcome packs for both.",
    category: "HR",
    priority: "HIGH",
    status: "IN_PROGRESS",
    ageHours: 560,
  },
  {
    title: "Replace flickering lights in corridor",
    description:
      "The ceiling lights in the corridor outside the finance office have been flickering for a week and are giving people headaches.",
    category: "ADMINISTRATION",
    priority: "MEDIUM",
    status: "COMPLETED",
    ageHours: 620,
  },
  {
    title: "Printer on 3rd floor prints blank pages",
    description:
      "The printer near the stairs on the 3rd floor prints blank pages for PDFs. Word documents print fine.",
    category: "IT",
    priority: "MEDIUM",
    status: "COMPLETED",
    ageHours: 680,
  },
  {
    title: "Courier pickup for contract documents",
    description:
      "Signed contract originals need to go to the client's office in the city centre by Friday. Please arrange a courier.",
    category: "OTHER",
    priority: "MEDIUM",
    status: "COMPLETED",
    ageHours: 740,
  },
  {
    title: "Payslip not received this month",
    description:
      "I haven't received my payslip email for this month, although the salary was paid. Could you resend it?",
    category: "HR",
    priority: "LOW",
    status: "COMPLETED",
    ageHours: 820,
  },
  {
    title: "Desk move to the marketing area",
    description:
      "I've transferred to the marketing team and would like my desk, monitor and drawers moved to their area on the 4th floor.",
    category: "ADMINISTRATION",
    priority: "LOW",
    status: "COMPLETED",
    ageHours: 950,
  },
];
