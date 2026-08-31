"use client";

import { useState } from "react";
import NextImage from "next/image";
import { SupervisionViewModeEnum } from "@my-hockey-network/contracts";
import type {
  PlayerDetailsFormValues,
  LinkPlayerFormValues,
} from "@my-hockey-network/validation";

import { Button } from "@/components/common/Button";
import { SupervisionCreatePlayerDetailsStep } from "@/components/features/supervision/SupervisionCreatePlayerDetailsStep";
import {
  CreatePlayerProtectStep,
  type ProtectSettings,
} from "@/components/features/supervision/CreatePlayerProtectStep";
import { LinkExistingPlayerStep } from "@/components/features/supervision/LinkExistingPlayerStep";

function formatShortPlayerName(name: string, maxLen = 14): string {
  if (!name) return "Player";
  const trimmed = name.trim();
  if (trimmed.length <= maxLen) return trimmed;
  const words = trimmed.split(/\s+/);
  if (words.length > 1 && words[0].length <= maxLen) return `${words[0]}...`;
  return `${trimmed.slice(0, maxLen)}...`;
}

export interface SupervisionAddPlayerFlowProps {
  viewMode: SupervisionViewModeEnum;
  onViewModeChange: (mode: SupervisionViewModeEnum) => void;
  isCreatingPlayer: boolean;
  isSendingLinkInvite: boolean;
  addedPlayerName: string;
  createdWardId: string | null;
  selectedWardId: string;
  onCreatePlayer: (details: PlayerDetailsFormValues) => Promise<boolean>;
  onSendLinkInvite: (values: LinkPlayerFormValues) => Promise<boolean>;
  onGoToSupervision: (targetId: string, playerName: string) => void;
  onNavigateHelp?: () => void;
}

/**
 * Supervision sidebar's "+" add-player wizard: choose create-vs-link, the
 * create-player details/protect/success steps, and the link-existing-player
 * form/sent-confirmation steps. Extracted from `screens/supervision-page.tsx`.
 * `CHOICE`/`CREATE_SUCCESS`/`LINK_SENT` stay inline here (small, no
 * validation) rather than as separate files, per the "no trivial wrapper"
 * guideline; `CREATE_DETAILS`/`CREATE_PROTECT`/`LINK_EXISTING` are their
 * own components since they own real form state.
 */
export function SupervisionAddPlayerFlow({
  viewMode,
  onViewModeChange,
  isCreatingPlayer,
  isSendingLinkInvite,
  addedPlayerName,
  createdWardId,
  selectedWardId,
  onCreatePlayer,
  onSendLinkInvite,
  onGoToSupervision,
  onNavigateHelp,
}: Readonly<SupervisionAddPlayerFlowProps>) {
  const [pendingPlayerDetails, setPendingPlayerDetails] =
    useState<PlayerDetailsFormValues | null>(null);

  if (viewMode === SupervisionViewModeEnum.CHOICE) {
    return (
      <div className="mhn-supervision-choice-view">
        <h2 className="mhn-parent-step-title mhn-supervision-choice-heading">
          How would you like to add them?
        </h2>

        <div className="mhn-parent-stack-gap-16 mhn-supervision-choice-wrapper">
          <div
            onClick={() =>
              onViewModeChange(SupervisionViewModeEnum.CREATE_DETAILS)
            }
            className="mhn-parent-choice-card"
          >
            <div className="mhn-parent-flex-row-center-16">
              <NextImage
                src="/addPlayer.webp"
                alt="Add Player"
                width={40}
                height={40}
                className="add-player-img"
              />
              <div>
                <div className="mhn-parent-card-title">
                  Create a new player profile
                </div>
                <div className="mhn-parent-card-sub">
                  Set up a player profile for your child.
                </div>
              </div>
            </div>
            <div className="mhn-parent-chevron">›</div>
          </div>

          <div
            onClick={() =>
              onViewModeChange(SupervisionViewModeEnum.LINK_EXISTING)
            }
            className="mhn-parent-choice-card"
          >
            <div className="mhn-parent-flex-row-center-16">
              <NextImage
                src="/linking.webp"
                alt="Link Existing"
                width={40}
                height={40}
                className="add-player-img"
              />
              <div>
                <div className="mhn-parent-card-title">
                  Link an existing player
                </div>
                <div className="mhn-parent-card-sub">
                  Connect with a player who already has a MyHockey account.
                </div>
              </div>
            </div>
            <div className="mhn-parent-chevron">›</div>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === SupervisionViewModeEnum.CREATE_DETAILS) {
    return (
      <SupervisionCreatePlayerDetailsStep
        isSubmitting={isCreatingPlayer}
        onBack={() => onViewModeChange(SupervisionViewModeEnum.CHOICE)}
        onContinue={(values) => {
          setPendingPlayerDetails(values);
          onViewModeChange(SupervisionViewModeEnum.CREATE_PROTECT);
        }}
      />
    );
  }

  if (viewMode === SupervisionViewModeEnum.CREATE_PROTECT) {
    return (
      <CreatePlayerProtectStep
        playerName={pendingPlayerDetails?.fullName || ""}
        isSubmitting={isCreatingPlayer}
        onBack={() => onViewModeChange(SupervisionViewModeEnum.CREATE_DETAILS)}
        onSubmit={async (_settings: ProtectSettings) => {
          if (!pendingPlayerDetails) return;
          const ok = await onCreatePlayer(pendingPlayerDetails);
          if (ok) onViewModeChange(SupervisionViewModeEnum.CREATE_SUCCESS);
        }}
      />
    );
  }

  if (viewMode === SupervisionViewModeEnum.CREATE_SUCCESS) {
    const shortName = formatShortPlayerName(addedPlayerName, 14);
    return (
      <div className="mhn-flow-container mhn-flow-success-box">
        <div className="mhn-success-circle-icon">
          <NextImage
            src="/CheckCircle.webp"
            alt="check-circle"
            width={129}
            height={129}
            className="checkCircle"
          />
        </div>

        <h2 className="mhn-flow-title">{shortName} has been added</h2>
        <p className="mhn-flow-subtitle">
          You&apos;re now managing {shortName}&apos;s hockey profile.
        </p>

        <div className="mhn-form-actions-stack mhn-form-actions-narrow">
          <Button
            className="mhn-btn-modal-submit mhn-btn-ellipsis-block"
            onClick={() => {
              const targetId = createdWardId || selectedWardId;
              onGoToSupervision(targetId, addedPlayerName);
            }}
            title={`Go to ${addedPlayerName || "Player"}'s Supervision`}
          >
            Go to Supervision Hub
          </Button>
        </div>
      </div>
    );
  }

  if (viewMode === SupervisionViewModeEnum.LINK_EXISTING) {
    return (
      <LinkExistingPlayerStep
        isSending={isSendingLinkInvite}
        onBack={() => onViewModeChange(SupervisionViewModeEnum.CHOICE)}
        onNavigateHelp={onNavigateHelp}
        onSend={async (values) => {
          const ok = await onSendLinkInvite(values);
          if (ok) onViewModeChange(SupervisionViewModeEnum.LINK_SENT);
        }}
      />
    );
  }

  if (viewMode === SupervisionViewModeEnum.LINK_SENT) {
    return (
      <div className="mhn-flow-container mhn-flow-success-box">
        <div className="mhn-request-sent-icon-wrapper">
          <NextImage
            alt="request-sent"
            src="/emailSent.webp"
            width={128}
            height={128}
          />
        </div>

        <h2 className="mhn-flow-title mhn-flow-title-large">Request Sent!</h2>
        <p className="mhn-flow-subtitle mhn-flow-subtitle-wide">
          We&apos;ve emailed your child. Once they approve, you&apos;ll have
          full access to their MyHockey Network. You can explore some public
          content in the meantime.
        </p>

        <div className="mhn-flow-button-container">
          <Button
            className="mhn-btn-solid-blue"
            onClick={() => onViewModeChange(SupervisionViewModeEnum.MAIN)}
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
