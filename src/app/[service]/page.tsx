import BottomBanner from "@/components/common/BottomBanner";
import VideoSection from "@/components/common/VideoSection";
import { servicesData } from "@/data/servicesData";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import GuaranteeSection from "./components/GuaranteeSection";
import HeroImage from "./components/HeroImage";
import ScrollSectionWithImage from "./components/ScrollSectionWithImage";
import SectionWrapper from "./components/SectionWrapper";

interface ServicePageProps {
  params: Promise<{ service: string }>;
}

export const dynamicParams = false;
export const dynamic = "force-static";

const Spacer = () => (
  <div className="spacer-lg h-[30px] md:h-[100px]" id="read-more" />
);

const StandardService = ({ serviceDetails }: { serviceDetails: any }) => {
  const { title, imageUrl, heading, description, sections } = serviceDetails;
  const { rightImageSection, leftImageSection, guaranteeSection } = sections;

  return (
    <div className="service-page">
      <HeroImage title={title} imgSrc={imageUrl} />
      <Spacer />
      <SectionWrapper
        heading={heading}
        description={description}
        imageUrl={rightImageSection.imageUrl}
        contentItems={rightImageSection.content}
      />
      <Spacer />
      <VideoSection service={true} height="690px" />
      <Spacer />
      <ScrollSectionWithImage
        imageUrl={leftImageSection.imageUrl}
        contentItems={leftImageSection.content}
        ctaText={leftImageSection.ctaText}
      />
      <Spacer />
      <GuaranteeSection
        guaranteeContent={guaranteeSection.content[0].details}
        imageUrl={guaranteeSection.imageUrl}
      />
      <BottomBanner />
    </div>
  );
};

export async function generateStaticParams() {
  return Object.keys(servicesData).map((service) => ({ service }));
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { service } = await params;
  const canonicalPath = `/${service}`;
  const absoluteUrl = `https://www.securecash.com.au${canonicalPath}`;

  const serviceDetails = servicesData[service];
  if (!serviceDetails) {
    return {
      title: "Service Not Found | SecureCash",
      description: "The requested service could not be found.",
    };
  }

  const metaTitle = serviceDetails.metaTitle || serviceDetails.title;
  const metaDescription = serviceDetails.description.replace(/<[^>]*>?/gm, "");
  const imageUrl = serviceDetails.imageUrl.startsWith("http")
    ? serviceDetails.imageUrl
    : `https://www.securecash.com.au${serviceDetails.imageUrl}`;

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.securecash.com.au",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: metaTitle,
          item: absoluteUrl,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: metaTitle,
      description: metaDescription,
      provider: {
        "@type": "Organization",
        name: "SecureCash",
        url: "https://www.securecash.com.au",
      },
      areaServed: {
        "@type": "Country",
        name: "Australia",
      },
      url: absoluteUrl,
      image: imageUrl,
    },
  ];

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: absoluteUrl,
    },
    robots: "index, follow",
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: absoluteUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: metaTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: [imageUrl],
    },
    other: {
      "application/ld+json": JSON.stringify(structuredData),
    },
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { service } = await params;

  const serviceDetails = servicesData[service];
  if (!serviceDetails) {
    notFound();
  }

  return <StandardService serviceDetails={serviceDetails} />;
}
