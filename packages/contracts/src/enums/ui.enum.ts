export enum NavTabEnum {
  HOME = 'home',
  MY_NETWORK = 'my-network',
  PROFILE = 'profile',
  SUPERVISION = 'supervision',
  SETTINGS = 'settings',
  ONBOARDING = 'onboarding',
  HELP = 'help',
}

export enum SupervisionMainTabEnum {
  PERMISSIONS = 'permissions',
  REQUESTS = 'requests',
  LOGS = 'logs',
}

export enum SupervisionViewModeEnum {
  MAIN = 'main',
  CHOICE = 'choice',
  CREATE_DETAILS = 'create-details',
  CREATE_PROTECT = 'create-protect',
  CREATE_SUCCESS = 'create-success',
  LINK_EXISTING = 'link-existing',
  LINK_SENT = 'link-sent',
}

export enum ProfileTabEnum {
  POSTS = 'posts',
  MEDIA = 'media',
  STATS = 'stats',
  ABOUT = 'about',
  GUARDIAN_REQUESTS = 'guardian-requests',
}

export enum ProfileAboutSectionEnum {
  INTRO = 'intro',
  CAREER = 'career',
  DETAILS = 'details',
}

export enum SettingsSubTabEnum {
  GENERAL = 'general',
  NOTIFICATION = 'notification',
  BLOCKED = 'blocked',
}

export enum NetworkViewModeEnum {
  NETWORK = 'network',
  CONNECTIONS = 'connections',
  GROUPS = 'groups',
  GROUP_DETAIL = 'group-detail',
}

export enum AuthModeEnum {
  SIGNUP = 'signup',
  LOGIN = 'login',
}

export enum FeedSortEnum {
  RECENT = 'RECENT',
  POPULAR = 'POPULAR',
  TRENDING = 'TRENDING',
}

export enum CreatePostAudienceEnum {
  EVERYONE = 'Everyone',
  GROUPS = 'Groups',
  CUSTOM = 'Custom',
}

export enum HockeyPositionEnum {
  CENTER = 'Center',
  LEFT_WING = 'Left Wing',
  RIGHT_WING = 'Right Wing',
  DEFENSE = 'Defense',
  GOALTENDER = 'Goaltender',
}

export enum ShootsCatchesEnum {
  LEFT = 'Left',
  RIGHT = 'Right',
}

export enum GenderCategoryEnum {
  MALE = 'Male',
  FEMALE = 'Female',
  NON_BINARY = 'Non-binary',
  PREFER_NOT_TO_SAY = 'Prefer not to say',
}

export enum ProfileVisibilityEnum {
  EVERYONE = 'EVERYONE',
  CONNECTIONS = 'CONNECTIONS',
  PRIVATE = 'PRIVATE',
}
