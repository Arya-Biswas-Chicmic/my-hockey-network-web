'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { ApprovalCodeModal } from '@/components/supervision/ApprovalCodeModal';
import { ParentOnboardingModal } from '@/components/features/parent';
import { useAuth } from '@/hooks/use-auth';
import { SupervisionMainTabEnum, SupervisionViewModeEnum, ToastTypeEnum } from '@my-hockey-network/contracts';
import { SUCCESS_MESSAGES } from '@my-hockey-network/constants';

import { useSupervisionWards } from '@/hooks/use-supervision-wards';
import { useSupervisionPermissions } from '@/hooks/use-supervision-permissions';
import { useSupervisionRequests } from '@/hooks/use-supervision-requests';
import { useSupervisionLogs } from '@/hooks/use-supervision-logs';
import { usePendingGuardianRequests } from '@/hooks/use-guardian-relationships';
import { SupervisionSidebar } from '@/components/features/supervision/SupervisionSidebar';
import { SupervisionAddPlayerFlow } from '@/components/features/supervision/SupervisionAddPlayerFlow';
import { SupervisionPermissionsTab } from '@/components/features/supervision/SupervisionPermissionsTab';
import { SupervisionRequestsTab } from '@/components/features/supervision/SupervisionRequestsTab';
import { SupervisionLogsTab } from '@/components/features/supervision/SupervisionLogsTab';
import { PageShell } from '@/components/layout/PageShell';

interface SupervisionPageProps {
  onNavigate?: (screen: string, extraData?: Record<string, unknown>) => void;
  onLogout?: () => void;
}

export const SupervisionPage: React.FC<SupervisionPageProps> = ({ onNavigate, onLogout }) => {
  const { showToast } = useAuth();
  const searchParams = useSearchParams();
  const initialWardIdFromNav =
    searchParams.get('userId') ||
    searchParams.get('selectedWardId') ||
    searchParams.get('childId');

  const [activeMainTab, setActiveMainTab] = useState<SupervisionMainTabEnum>(SupervisionMainTabEnum.PERMISSIONS);
  const [viewMode, setViewMode] = useState<SupervisionViewModeEnum>(SupervisionViewModeEnum.MAIN);
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);
  const [approvalModalConfig, setApprovalModalConfig] = useState<{
    isOpen: boolean;
    targetName: string;
    code?: string;
    action: 'approve' | 'decline';
  }>({ isOpen: false, targetName: '', code: '', action: 'approve' });

  const permissions = useSupervisionPermissions(showToast);

  const wards = useSupervisionWards({
    initialWardId: initialWardIdFromNav,
    // Same load/finally pairing as `handleSelectWard` below — this used to
    // call `fetchControlsForWard` without ever touching `isControlsLoading`
    // at all, so a ward auto-selected on page load (as opposed to one the
    // user clicks) left the permissions skeleton showing forever too.
    onWardsRefreshed: (wardId) => {
      permissions.setIsControlsLoading(true);
      void permissions.fetchControlsForWard(wardId).finally(() => permissions.setIsControlsLoading(false));
    },
    showToast,
  });

  const guardianRequestsQuery = usePendingGuardianRequests({
    enabled: activeMainTab === SupervisionMainTabEnum.REQUESTS,
  });

  const requests = useSupervisionRequests({
    activeMainTab,
    requestsTabValue: SupervisionMainTabEnum.REQUESTS,
    selectedWardId: wards.selectedWardId,
    onWardApproved: wards.refreshAfterParentOnboarding,
    showToast,
  });

  const logs = useSupervisionLogs(
    wards.selectedWardId,
    permissions.setHomePermissions,
    permissions.setNetworkPermissions,
    permissions.setMessagingPermissions,
  );

  const handleSelectWard = async (wardId: string) => {
    wards.setSelectedWardId(wardId);
    setViewMode(SupervisionViewModeEnum.MAIN);
    permissions.setIsControlsLoading(true);
    try {
      await permissions.fetchControlsForWard(wardId);
    } finally {
      permissions.setIsControlsLoading(false);
    }
  };

  return (
    <div className="mhn-supervision-page-root">
      <PageShell className="mhn-supervision-main-container">
        <div className="mhn-supervision-card-wrapper">
          <SupervisionSidebar
            wards={wards.wards}
            isLoading={wards.apiLoading}
            selectedWardId={wards.selectedWardId}
            viewMode={viewMode}
            onSelectWard={handleSelectWard}
            onAddPlayerClick={() => setViewMode(SupervisionViewModeEnum.CHOICE)}
          />

          <section className="mhn-supervision-content-area">
            {viewMode !== SupervisionViewModeEnum.MAIN ? (
              <SupervisionAddPlayerFlow
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                isCreatingPlayer={wards.isCreatingPlayer}
                isSendingLinkInvite={wards.isSendingLinkInvite}
                addedPlayerName={wards.addedPlayerName}
                createdWardId={wards.createdWardId}
                selectedWardId={wards.selectedWardId}
                onCreatePlayer={wards.createPlayer}
                onSendLinkInvite={wards.sendLinkInvitation}
                onNavigateHelp={() => onNavigate?.('help')}
                onGoToSupervision={(targetId, playerName) => {
                  setViewMode(SupervisionViewModeEnum.MAIN);
                  if (targetId) wards.setSelectedWardId(targetId);
                  onNavigate?.('supervision', { selectedWardId: targetId, userId: targetId, childId: targetId, childName: playerName });
                }}
              />
            ) : (
              <>
                <div className="mhn-supervision-tabs-row">
                  <Button
                    type="button"
                    onClick={() => setActiveMainTab(SupervisionMainTabEnum.PERMISSIONS)}
                    className={`mhn-supervision-tab-btn ${activeMainTab === SupervisionMainTabEnum.PERMISSIONS ? 'mhn-tab-active' : ''}`}
                  >
                    Permissions
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveMainTab(SupervisionMainTabEnum.REQUESTS)}
                    className={`mhn-supervision-tab-btn ${activeMainTab === SupervisionMainTabEnum.REQUESTS ? 'mhn-tab-active' : ''}`}
                  >
                    Requests
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveMainTab(SupervisionMainTabEnum.LOGS)}
                    className={`mhn-supervision-tab-btn ${activeMainTab === SupervisionMainTabEnum.LOGS ? 'mhn-tab-active' : ''}`}
                  >
                    Logs
                  </Button>
                </div>

                <div className="mhn-supervision-tab-body">
                  {activeMainTab === SupervisionMainTabEnum.PERMISSIONS && (
                    <SupervisionPermissionsTab
                      isLoading={permissions.isControlsLoading}
                      homePermissions={permissions.homePermissions}
                      networkPermissions={permissions.networkPermissions}
                      messagingPermissions={permissions.messagingPermissions}
                      notificationPermissions={permissions.notificationPermissions}
                      updatingControlKey={permissions.updatingControlKey}
                      onToggle={(controlKey, currentVal, setter) =>
                        void permissions.handleToggleControl(wards.selectedWardId, controlKey, currentVal, setter)
                      }
                      setHomePermissions={permissions.setHomePermissions}
                      setNetworkPermissions={permissions.setNetworkPermissions}
                      setMessagingPermissions={permissions.setMessagingPermissions}
                      setNotificationPermissions={permissions.setNotificationPermissions}
                    />
                  )}

                  {activeMainTab === SupervisionMainTabEnum.REQUESTS && (
                    <SupervisionRequestsTab
                      requestNotice={requests.requestNotice}
                      guardianRequestsQuery={guardianRequestsQuery}
                      livePendingRequests={requests.livePendingRequests}
                      isRequestsLoading={requests.isRequestsLoading}
                      requestActionLoading={requests.requestActionLoading}
                      onApproveApprovalItem={(id) => void requests.handleApproveApprovalItem(id)}
                      onDeclineApprovalItem={(id) => void requests.handleDeclineApprovalItem(id)}
                      onDeclineByCode={(code) => void requests.handleDeclineCodeSubmit(code).catch(() => {})}
                      onOpenApproveModal={(targetName, code) =>
                        setApprovalModalConfig({ isOpen: true, targetName, code, action: 'approve' })
                      }
                      onOpenDeclineModal={(targetName) =>
                        setApprovalModalConfig({ isOpen: true, targetName, code: '', action: 'decline' })
                      }
                    />
                  )}

                  {activeMainTab === SupervisionMainTabEnum.LOGS && (
                    <SupervisionLogsTab
                      logs={logs.filteredLogs}
                      searchQuery={logs.logsSearchQuery}
                      onSearchQueryChange={logs.setLogsSearchQuery}
                    />
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </PageShell>

      <ApprovalCodeModal
        isOpen={approvalModalConfig.isOpen}
        targetName={approvalModalConfig.targetName}
        initialCode={approvalModalConfig.code}
        loading={requests.requestActionLoading}
        title={approvalModalConfig.action === 'approve' ? 'Approve Supervision' : 'Decline Guardian Request'}
        submitLabel={approvalModalConfig.action === 'approve' ? 'Confirm & Approve' : 'Confirm & Decline'}
        onClose={() => setApprovalModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onSubmit={async (enteredCode) => {
          if (approvalModalConfig.action === 'approve') {
            await requests.handleApproveCodeSubmit(enteredCode);
          } else {
            await requests.handleDeclineCodeSubmit(enteredCode);
          }
          setApprovalModalConfig((prev) => ({ ...prev, isOpen: false }));
        }}
      />
      <ParentOnboardingModal
        isOpen={isAddPlayerModalOpen}
        isStandaloneModal={true}
        onClose={() => setIsAddPlayerModalOpen(false)}
        onComplete={async (data) => {
          setIsAddPlayerModalOpen(false);
          showToast(SUCCESS_MESSAGES.PLAYER_UPDATED, ToastTypeEnum.SUCCESS);
          await wards.refreshAfterParentOnboarding();
          if (data?.playerId) onNavigate?.('profile', { userId: data.playerId });
        }}
      />
    </div>
  );
};
