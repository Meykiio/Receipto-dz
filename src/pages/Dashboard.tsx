import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import ReceiptDetailsModal from "@/components/ReceiptDetailsModal";
import MobileReceiptDetailsModal from "@/components/MobileReceiptDetailsModal";
import { formatCurrency } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { EditReceiptModal } from "@/components/EditReceiptModal";
import { useUserSettings } from "@/contexts/UserSettingsContext";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import BudgetBar from "@/components/BudgetBar";
import { ReceiptTable } from "@/components/receipts/ReceiptTable";
import { ReceiptPagination } from "@/components/receipts/ReceiptPagination";
import DeleteReceiptsDialog from "@/components/receipts/DeleteReceiptsDialog";
import { useReceiptList } from "@/hooks/useReceiptList";

const Dashboard = () => {
  const { t } = useTranslation();
  const { userSettings } = useUserSettings();
  const {
    state, budget, isMobile,
    sortOrder, setSortOrder, searchTerm, setSearchTerm,
    page, setPage, totalPages, pageNumbers, paginatedReceipts,
    spentThisMonth, isDeleteDialogOpen, setIsDeleteDialogOpen, isDeleting,
    handleOpenDetailsModal, handleCloseDetailsModal, handleEditReceipt,
    handleReceiptUpdated, handleOpenDeleteDialog, handleCloseDeleteDialog,
    toggleAll, toggleOne, handleDeleteConfirm, handleDeleteAll, exportData, formatDate,
  } = useReceiptList(userSettings?.currency);

  return (
    <AppLayout>
      <div className="p-4 md:p-6">
        <PageHeader title={t("dashboard.title")} description={t("dashboard.subtitle")} />

        <OnboardingChecklist hasReceipts={state.receipts.length > 0} />

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label={t("dashboard.spentThisMonth")}
            value={formatCurrency(spentThisMonth, userSettings?.currency)}
            money
          />
          <StatCard
            label={t("dashboard.budgetRemaining")}
            value={budget ? formatCurrency(Math.max((budget.amount || 0) - spentThisMonth, 0), budget.currency || userSettings?.currency) : "—"}
          >
            {budget ? <BudgetBar spent={spentThisMonth} budget={budget.amount || 0} /> : null}
          </StatCard>
          <StatCard
            label={t("dashboard.totalReceipts")}
            value={state.receipts.length}
            delta={state.receipts.length > 0 ? { text: t("dashboard.totalItemsCount", { count: state.receipts.reduce((n, r) => n + (r.items?.length || 0), 0) }) } : undefined}
          />
        </div>

        {/* Search + actions */}
        <div className="mb-6 rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <Input
              type="search"
              placeholder={t("dashboard.searchPlaceholder")}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full md:flex-1"
            />
            <div className="flex flex-col gap-2 sm:flex-row md:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-center sm:w-auto">{t("dashboard.export")}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => exportData("csv")} disabled={state.selectedReceipts.length === 0}>{t("dashboard.exportCsv")}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportData("excel")} disabled={state.selectedReceipts.length === 0}>{t("dashboard.exportExcel")}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportData("json")} disabled={state.selectedReceipts.length === 0}>{t("dashboard.exportJson")}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={state.selectedReceipts.length === 0}
                className="w-full justify-center sm:w-auto"
              >
                {t("dashboard.delete")}
              </Button>
              <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
                <SelectTrigger className="w-full sm:w-[140px]" aria-label={t("a11y.sortReceipts")}>
                  <SelectValue placeholder={t("dashboard.sort")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">{t("dashboard.newestFirst")}</SelectItem>
                  <SelectItem value="asc">{t("dashboard.oldestFirst")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {state.loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="mb-2 h-4 w-[200px]" />
                  <Skeleton className="mb-2 h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : state.error ? (
          <p className="text-destructive">Error: {state.error}</p>
        ) : state.receipts.length === 0 ? (
          <EmptyState
            title={t("dashboard.noReceipts")}
            description={t("dashboard.noReceiptsDesc")}
            actionLabel={t("dashboard.uploadAction")}
            actionLink="/capture"
            variant="info"
          />
        ) : (
          <ReceiptTable
            receipts={paginatedReceipts}
            selectedIds={state.selectedReceipts}
            selectAll={state.selectAll}
            currency={userSettings?.currency}
            onToggleAll={toggleAll}
            onToggleOne={toggleOne}
            onOpen={handleOpenDetailsModal}
            onDelete={handleOpenDeleteDialog}
            formatDate={formatDate}
            labelImage={t("dashboard.image")}
            labelVendor={t("dashboard.vendor")}
            labelUploadDate={t("dashboard.uploadDate")}
            labelReceiptDate={t("dashboard.receiptDate")}
            labelTotal={t("dashboard.total")}
            labelActions={t("dashboard.actions")}
            labelView={t("dashboard.view")}
          />
        )}

        <ReceiptPagination
          page={page}
          totalPages={totalPages}
          pageNumbers={pageNumbers}
          onPage={setPage}
          labelPrevious={t("common.previous")}
          labelNext={t("common.next")}
        />

        {state.selectedReceipt && (
          <ReceiptDetailsModal
            isOpen={state.isDetailsModalOpen}
            onClose={handleCloseDetailsModal}
            receipt={state.selectedReceipt}
            onReceiptUpdated={handleReceiptUpdated}
            onEdit={handleEditReceipt}
          />
        )}
        {state.selectedReceipt && isMobile && (
          <MobileReceiptDetailsModal
            isOpen={state.isMobileDetailsModalOpen}
            onClose={handleCloseDetailsModal}
            receipt={state.selectedReceipt}
            onEdit={handleEditReceipt}
            onReceiptUpdated={handleReceiptUpdated}
          />
        )}
        {state.selectedReceipt && state.isEditModalOpen && (
          <EditReceiptModal
            receipt={state.selectedReceipt}
            isOpen={state.isEditModalOpen}
            onClose={() => { handleCloseDetailsModal(); }}
            onSave={handleReceiptUpdated}
          />
        )}

        <DeleteReceiptsDialog
          open={isDeleteDialogOpen}
          isDeleting={isDeleting}
          title={state.selectedReceipts.length > 0 ? t("dashboard.deleteTitleMany") : t("dashboard.deleteTitleOne")}
          description={t("dashboard.deleteDesc")}
          cancelLabel={t("common.cancel")}
          deleteLabel={t("common.delete")}
          loadingLabel={t("common.loading")}
          onClose={handleCloseDeleteDialog}
          onConfirm={state.selectedReceipts.length > 0 ? handleDeleteAll : handleDeleteConfirm}
        />
      </div>
    </AppLayout>
  );
};

export default Dashboard;