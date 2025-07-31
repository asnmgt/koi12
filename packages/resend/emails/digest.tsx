import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type DigestEntry = {
  label: string;
  value: string;
};

type DigestContent = {
  type: "structured" | "unstructured";
  content: DigestEntry[] | string;
};

type DigestItem = {
  from: string;
  subject: string;
  content?: DigestContent | null | undefined;
};

const colorClasses = {
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    bgAccent: "bg-blue-100",
  },
  green: {
    bg: "bg-green-50",
    text: "text-green-800",
    border: "border-green-200",
    bgAccent: "bg-green-100",
  },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-800",
    border: "border-purple-200",
    bgAccent: "bg-purple-100",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    bgAccent: "bg-amber-100",
  },
  gray: {
    bg: "bg-gray-50",
    text: "text-gray-800",
    border: "border-gray-200",
    bgAccent: "bg-gray-100",
  },
  pink: {
    bg: "bg-pink-50",
    text: "text-pink-800",
    border: "border-pink-200",
    bgAccent: "bg-pink-100",
  },
  red: {
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
    bgAccent: "bg-red-100",
  },
} as const;

export type DigestEmailProps = {
  baseUrl: string;
  unsubscribeToken: string;
  date?: Date;
  ruleNames?: Record<string, string>;
  [key: string]:
    | DigestItem[]
    | undefined
    | string
    | Date
    | Record<string, string>
    | undefined;
};

export default function DigestEmail(props: DigestEmailProps) {
  const {
    baseUrl = "https://www.getinboxzero.com",
    unsubscribeToken,
    ruleNames,
    ...digestData
  } = props;

  const availableCategories = {
    newsletter: {
      name: "Newsletter",
      emoji: "📰",
      color: "blue",
      href: "#newsletters",
    },
    receipt: {
      name: "Receipt",
      emoji: "🧾",
      color: "green",
      href: "#receipts",
    },
    marketing: {
      name: "Marketing",
      emoji: "🔊",
      color: "purple",
      href: "#marketing",
    },
    calendar: {
      name: "Calendar",
      emoji: "📅",
      color: "amber",
      href: "#calendar",
    },
    coldEmail: {
      name: "Cold Email",
      emoji: "🧊",
      color: "gray",
      href: "#cold-emails",
    },
    notification: {
      name: "Notification",
      emoji: "🔔",
      color: "pink",
      href: "#notifications",
    },
    toReply: {
      name: "To Reply",
      emoji: "⏰",
      color: "red",
      href: "#to-reply",
    },
  };

  const getCategoryInfo = (key: string) => {
    const displayName = ruleNames?.[key] || key;
    if (key in availableCategories) {
      const categoryInfo =
        availableCategories[key as keyof typeof availableCategories];
      return {
        ...categoryInfo,
        name: displayName,
      };
    }

    // Fallback for unknown categories
    return {
      name: displayName,
      emoji: "📂",
      color: "gray",
      href: `#${key}`,
    };
  };

  const getCategoriesWithItemsCount = () => {
    return Object.keys(digestData).filter(
      (key) =>
        Array.isArray(digestData[key]) && (digestData[key]?.length ?? 0) > 0,
    ).length;
  };

  /**
   * Renders a grid of categories with a count of the number of emails in each category.
   * This is needed because we have a total of 7 categories that can be displayed varying from 2 to 7.
   * The grid is rendered differently depending on the number of categories.
   *
   * 2 categories: single row
   * 3-4 categories: 2x2 grid
   * 5-7 categories: 2x2 grid + bottom row
   *
   * @returns Renders a grid of categories with a count of the number of emails in each category.
   */
  const renderCategoryGrid = () => {
    // Get all present categories in digestData
    const categories = Object.keys(digestData)
      .filter(
        (key) =>
          Array.isArray(digestData[key]) && (digestData[key]?.length ?? 0) > 0,
      )
      .map((key) => {
        const items = digestData[key] as DigestItem[];
        const info = getCategoryInfo(key);
        return {
          key,
          ...info,
          count: items.length,
        };
      });

    const categoryCount = categories.length;
    if (categoryCount === 0) return null;

    // For all cases: ensure max 2 items per row
    const rows = [];
    const totalRows = Math.ceil(categoryCount / 2);

    for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
      const startIndex = rowIndex * 2;
      const endIndex = Math.min(startIndex + 2, categoryCount);
      const isLastRow = rowIndex === totalRows - 1;
      const itemsInThisRow = endIndex - startIndex;

      rows.push(
        <Row key={rowIndex} className={isLastRow ? "mb-[0px]" : "mb-[6px]"}>
          {categories.slice(startIndex, endIndex).map((category, index) => (
            <Column
              key={category.key}
              className={`w-[50%] ${
                itemsInThisRow === 1
                  ? ""
                  : index === 0
                    ? "pr-[4px]"
                    : "pl-[4px]"
              }`}
            >
              <Link href={category.href} className="no-underline">
                <div
                  className={`${colorClasses[category.color as keyof typeof colorClasses].bg} p-[8px] rounded-[4px]`}
                >
                  <Row>
                    <Column
                      style={{ textAlign: "left", verticalAlign: "middle" }}
                    >
                      <Text
                        className={`text-[13px] font-medium ${colorClasses[category.color as keyof typeof colorClasses].text} m-0`}
                      >
                        {category.emoji} {category.name}
                      </Text>
                    </Column>
                    <Column
                      style={{ textAlign: "right", verticalAlign: "middle" }}
                    >
                      <div
                        className={`${colorClasses[category.color as keyof typeof colorClasses].bgAccent} px-[8px] py-[2px] rounded-[12px]`}
                        style={{ display: "inline-block" }}
                      >
                        <Text
                          className={`text-[12px] font-bold ${colorClasses[category.color as keyof typeof colorClasses].text} m-0`}
                        >
                          {category.count}
                        </Text>
                      </div>
                    </Column>
                  </Row>
                </div>
              </Link>
            </Column>
          ))}
        </Row>,
      );
    }

    return rows;
  };

  // Return early if no digest items are found
  const hasItems = Object.keys(digestData).some(
    (key) =>
      Array.isArray(digestData[key]) && (digestData[key]?.length ?? 0) > 0,
  );

  if (!hasItems) {
    return null;
  }

  const CategorySection = ({
    categoryKey,
    items,
  }: {
    categoryKey: string;
    items: DigestItem[];
  }) => {
    if (items.length === 0) return null;
    const category = getCategoryInfo(categoryKey);
    const colors =
      colorClasses[category.color as keyof typeof colorClasses] ||
      colorClasses.gray;
    return (
      <Section className="mb-[20px]" id={category.href.slice(1)}>
        <div className={`${colors.bg} rounded-[6px] p-[12px]`}>
          <Heading
            className={`text-[16px] font-bold ${colors.text} mt-[0px] mb-[12px]`}
          >
            {category.emoji} {category.name} ({items.length})
          </Heading>

          {items.map((item, index) => (
            <div
              key={index}
              className={`mb-[8px] bg-white rounded-[6px] p-[10px] border-solid border-[1px] ${colors.border}`}
            >
              <Text className="text-[14px] font-bold text-gray-800 m-0">
                {item.subject}
              </Text>
              <Text className="text-[12px] text-gray-800 mt-[1px] mb-[10px] leading-[15px]">
                {item.from}
              </Text>
              {item.content?.type === "structured" &&
              Array.isArray(item.content.content) ? (
                <Section className="mt-3 rounded-lg bg-white/50 p-0 text-left">
                  {item.content.content.map(
                    (entry: DigestEntry, idx: number) => (
                      <Row key={idx} className="mb-0 p-0">
                        <Column>
                          <Text className="m-0 text-gray-800 text-[14px] leading-[21px]">
                            {entry.label}
                          </Text>
                        </Column>
                        <Column align="right">
                          <Text className="m-0 font-semibold text-gray-700 text-[14px] leading-[21px]">
                            {entry.value}
                          </Text>
                        </Column>
                      </Row>
                    ),
                  )}
                </Section>
              ) : (
                <Text className="text-[14px] text-gray-500 mt-[2px] m-0 leading-[21px]">
                  {item.content?.type === "unstructured"
                    ? (item.content.content as string)
                    : ""}
                </Text>
              )}
            </div>
          ))}
        </div>
      </Section>
    );
  };

  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto w-full max-w-[600px] p-0">
            <Section className="p-4 text-center">
              <Link href={baseUrl} className="text-[15px]">
                <Img
                  src={"https://www.getinboxzero.com/icon.png"}
                  width="40"
                  height="40"
                  alt="Inbox Zero"
                  className="mx-auto my-0"
                />
              </Link>

              <Text className="mx-0 mb-8 mt-4 p-0 text-center text-2xl font-normal">
                <span className="font-semibold tracking-tighter">
                  Inbox Zero
                </span>
              </Text>

              <Heading className="my-4 text-4xl font-medium leading-tight">
                Your Digest
              </Heading>
              <Text className="mb-8 text-lg leading-8">
                Here's a summary of what's happened in your inbox.
              </Text>
            </Section>

            {getCategoriesWithItemsCount() > 1 && (
              <Section className="mb-[24px]">{renderCategoryGrid()}</Section>
            )}
            {Object.keys(digestData).map((categoryKey) =>
              Array.isArray(digestData[categoryKey]) &&
              digestData[categoryKey]?.length > 0 ? (
                <CategorySection
                  key={categoryKey}
                  categoryKey={categoryKey}
                  items={digestData[categoryKey] as DigestItem[]}
                />
              ) : null,
            )}
            <Hr className="border-solid border-gray-200 my-[24px]" />
            <Footer baseUrl={baseUrl} unsubscribeToken={unsubscribeToken} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

DigestEmail.PreviewProps = {
  baseUrl: "https://www.getinboxzero.com",
  unsubscribeToken: "123",
  ruleNames: {
    newsletter: "Newsletter",
    receipt: "Receipt",
    marketing: "Marketing",
    calendar: "Calendar",
    coldEmail: "Cold Email",
    notification: "Notification",
    toReply: "To Reply",
    travel: "Travel",
    funnyStuff: "Funny Stuff",
    orders: "Orders",
  },
  newsletter: [
    {
      from: "Morning Brew",
      subject: "🔥 Today's top business stories",
      content: {
        type: "unstructured",
        content:
          "The latest on tech layoffs, market trends, and startup funding rounds...",
      },
    },
    {
      from: "The New York Times",
      subject: "Breaking News: Latest developments",
      content: {
        type: "unstructured",
        content:
          "Stay informed with the latest headlines and analysis from around the world...",
      },
    },
    {
      from: "Product Hunt Daily",
      subject: "🚀 Today's hottest tech products",
      content: {
        type: "unstructured",
        content:
          "Discover the newest apps, websites, and tech products that launched today...",
      },
    },
  ],
  receipt: [
    {
      from: "Amazon",
      subject: "Order #112-3456789-0123456",
      content: {
        type: "structured",
        content: [
          { label: "Merchant", value: "Amazon" },
          { label: "Amount", value: "$42.99" },
          { label: "Date", value: "9:15 AM" },
        ],
      },
    },
    {
      from: "Uber Eats",
      subject: "Order #EAT-123456789",
      content: {
        type: "structured",
        content: [
          { label: "Merchant", value: "Uber Eats" },
          { label: "Amount", value: "$23.45" },
          { label: "Date", value: "1:20 PM" },
        ],
      },
    },
    {
      from: "Netflix",
      subject: "Monthly subscription",
      content: {
        type: "structured",
        content: [
          { label: "Merchant", value: "Netflix" },
          { label: "Amount", value: "$15.99" },
          { label: "Date", value: "4:30 AM" },
        ],
      },
    },
  ],
  marketing: [
    {
      from: "Spotify",
      subject: "Limited offer: 3 months premium for $0.99",
      content: {
        type: "unstructured",
        content: "Upgrade your music experience with this exclusive deal",
      },
    },
    {
      from: "Nike",
      subject: "JUST IN: New Summer Collection 🔥",
      content: {
        type: "unstructured",
        content: "Be the first to shop our latest styles before they sell out",
      },
    },
    {
      from: "Airbnb",
      subject: "Weekend getaway ideas near you",
      content: {
        type: "unstructured",
        content:
          "Discover unique stays within a 2-hour drive from your location",
      },
    },
  ],
  calendar: [
    {
      from: "Sarah Johnson",
      subject: "Team Weekly Sync",
      content: {
        type: "structured",
        content: [
          { label: "Title", value: "Team Weekly Sync" },
          {
            label: "Date",
            value: "Tomorrow, 10:00 AM - 11:00 AM • Meeting Room 3 / Zoom",
          },
        ],
      },
    },
    {
      from: "Michael Chen",
      subject: "Quarterly Review",
      content: {
        type: "structured",
        content: [
          { label: "Title", value: "Quarterly Review" },
          {
            label: "Date",
            value: "Friday, May 26, 2:00 PM - 4:00 PM • Conference Room A",
          },
        ],
      },
    },
    {
      from: "Personal Calendar",
      subject: "Dentist Appointment",
      content: {
        type: "structured",
        content: [
          { label: "Title", value: "Dentist Appointment" },
          {
            label: "Date",
            value: "Monday, May 29, 9:30 AM • Downtown Dental Clinic",
          },
        ],
      },
    },
  ],
  coldEmail: [
    {
      from: "David Williams",
      subject: "Partnership opportunity for your business",
      content: {
        type: "unstructured",
        content: "Growth Solutions Inc.",
      },
    },
    {
      from: "Jennifer Lee",
      subject: "Request for a quick call this week",
      content: {
        type: "unstructured",
        content: "Venture Capital Partners",
      },
    },
    {
      from: "Robert Taylor",
      subject: "Introducing our new B2B solution",
      content: {
        type: "unstructured",
        content: "Enterprise Tech Solutions",
      },
    },
  ],
  notification: [
    {
      from: "LinkedIn",
      subject: "Profile Views",
      content: {
        type: "structured",
        content: [
          { label: "Title", value: "Profile Views" },
          {
            label: "Date",
            value: "5 people viewed your profile this week • 11:00 AM",
          },
        ],
      },
    },
    {
      from: "Slack",
      subject: "Unread Messages",
      content: {
        type: "structured",
        content: [
          { label: "Title", value: "Unread Messages" },
          {
            label: "Date",
            value: "3 unread messages in #general channel • 2:45 PM",
          },
        ],
      },
    },
    {
      from: "GitHub",
      subject: "Pull Request Update",
      content: {
        type: "structured",
        content: [
          { label: "Title", value: "Pull Request Update" },
          { label: "Date", value: "Pull request #123 was approved • 5:30 PM" },
        ],
      },
    },
    {
      from: "Twitter",
      subject: "New Followers",
      content: {
        type: "structured",
        content: [
          { label: "Title", value: "New Followers" },
          { label: "Date", value: "You have 7 new followers • 6:15 PM" },
        ],
      },
    },
  ],
  toReply: [
    {
      from: "John Smith",
      subject: "Re: Project proposal feedback",
      content: {
        type: "unstructured",
        content: "Received: Yesterday, 4:30 PM • Due: Today",
      },
    },
    {
      from: "Client XYZ",
      subject: "Questions about the latest deliverable",
      content: {
        type: "unstructured",
        content: "Received: Monday, 10:15 AM • Due: Tomorrow",
      },
    },
    {
      from: "HR Department",
      subject: "Annual review scheduling",
      content: {
        type: "unstructured",
        content: "Received: Tuesday, 9:00 AM • Due: Friday",
      },
    },
  ],
  // --- Custom categories for testing ---
  travel: [
    {
      from: "Expedia",
      subject: "Your flight to Paris is booked!",
      content: {
        type: "unstructured",
        content: "Flight departs July 10th at 7:00 PM. Confirmation #ABC123.",
      },
    },
    {
      from: "Airbnb",
      subject: "Upcoming stay in Montmartre",
      content: {
        type: "unstructured",
        content: "Check-in: July 11th, Check-out: July 18th. Host: Marie.",
      },
    },
  ],
  funnyStuff: [
    {
      from: "The Onion",
      subject: "Area Man Unsure If He’s Living In Simulation Or Just Milwaukee",
      content: {
        type: "unstructured",
        content:
          "Local man questions reality after seeing three people in cheese hats.",
      },
    },
    {
      from: "Reddit",
      subject: "Top meme of the day",
      content: {
        type: "unstructured",
        content: "A cat wearing sunglasses and riding a Roomba.",
      },
    },
  ],
  orders: [
    {
      from: "Shopify",
      subject: "Order #SHOP-2024-001",
      content: {
        type: "structured",
        content: [
          { label: "Order ID", value: "SHOP-2024-001" },
          { label: "Total", value: "$89.99" },
          { label: "Status", value: "Shipped" },
          { label: "Tracking", value: "1Z999AA1234567890" },
        ],
      },
    },
    {
      from: "Etsy",
      subject: "Your handmade jewelry order",
      content: {
        type: "structured",
        content: [
          { label: "Seller", value: "HandmadeCrafts" },
          { label: "Item", value: "Sterling Silver Necklace" },
          { label: "Price", value: "$45.00" },
          { label: "Estimated Delivery", value: "March 15-20" },
        ],
      },
    },
    {
      from: "Amazon",
      subject: "Order #114-1234567-8901234",
      content: {
        type: "structured",
        content: [
          { label: "Order Number", value: "114-1234567-8901234" },
          { label: "Items", value: "3 items" },
          { label: "Total", value: "$156.78" },
          { label: "Delivery", value: "Tomorrow by 8 PM" },
        ],
      },
    },
  ],
};

function Footer({
  baseUrl,
  unsubscribeToken,
}: {
  baseUrl: string;
  unsubscribeToken: string;
}) {
  return (
    <Section className="mt-8 text-center text-sm text-gray-500">
      <Text className="m-0">
        You're receiving this email because you enabled digest emails in your
        Inbox Zero settings.
      </Text>
      <Text className="m-0">
        <Link
          href={`${baseUrl}/api/unsubscribe?token=${unsubscribeToken}`}
          className="text-gray-500 underline"
        >
          Unsubscribe
        </Link>
      </Text>
    </Section>
  );
}
