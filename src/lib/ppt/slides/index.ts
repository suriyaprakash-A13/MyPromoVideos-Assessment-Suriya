import { SlideBuilder } from "@/lib/ppt/types";
import { buildCoverSlide } from "@/lib/ppt/slides/cover";
import { buildExecutiveSlide } from "@/lib/ppt/slides/executive";
import { buildTrendVelocitySlide } from "@/lib/ppt/slides/trendVelocity";
import { buildChannelSlide } from "@/lib/ppt/slides/channel";
import { buildTopViewsSlide } from "@/lib/ppt/slides/topViews";
import { buildTopEngagementSlide } from "@/lib/ppt/slides/topEngagement";
import { buildTopicsSlide } from "@/lib/ppt/slides/topics";
import { buildCadenceSlide } from "@/lib/ppt/slides/cadence";
import { buildEngagementSlide } from "@/lib/ppt/slides/engagement";
import { buildBestTimeSlide } from "@/lib/ppt/slides/bestTime";
import { buildGapSlide } from "@/lib/ppt/slides/gap";
import { buildRecommendationsSlide } from "@/lib/ppt/slides/recommendations";
import { buildRankingSlide } from "@/lib/ppt/slides/ranking";
import { buildMethodologySlide } from "@/lib/ppt/slides/methodology";

export const SLIDE_BUILDERS: readonly SlideBuilder[] = [
  buildCoverSlide,
  buildExecutiveSlide,
  buildTrendVelocitySlide,
  buildChannelSlide,
  buildTopViewsSlide,
  buildTopEngagementSlide,
  buildTopicsSlide,
  buildCadenceSlide,
  buildEngagementSlide,
  buildBestTimeSlide,
  buildGapSlide,
  buildRecommendationsSlide,
  buildRankingSlide,
  buildMethodologySlide
];
