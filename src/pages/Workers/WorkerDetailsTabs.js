import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Tab,
  Tabs,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Pagination,
} from "@mui/material";
import StatusDropdown from "../../components/StatusDropdown";
import { useTranslation } from "react-i18next";

/* =======================
   SHARED STYLES
======================= */
export const HeaderStyles = {
  color: "#44546F",
  fontSize: "14px",
  fontFamily: "Poppins, sans-serif",
  fontWeight: 600,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  alignItems: "center",
};

export const DataStyles = {
  color: "#172B4D",
  fontSize: "12px",
  fontFamily: "Poppins, sans-serif",
  fontWeight: 400,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

/* =======================
   FORMATTERS
======================= */
export const formatEnumText = (value) => {
  if (!value || typeof value !== "string") return "—";
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

export const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const CenteredCell = ({ children }) => (
  <Box
    sx={{
      display: "inline-flex",
      alignItems: "center",
      pointerEvents: "none",
    }}
  >
    {children}
  </Box>
);

/* =======================
   PAGINATION
======================= */
const paginationSx = {
  mt: 2,
  display: "flex",
  justifyContent: "center",
  "& .MuiPaginationItem-root": {
    fontFamily: "Poppins, sans-serif",
    fontSize: 13,
    fontWeight: 500,
  },
  "& .Mui-selected": {
    backgroundColor: "#E9F3FF",
    color: "#006EC2",
  },
};

const ROWS_PER_PAGE = 5;

/* =======================
   TASKS TAB
======================= */
const TasksTab = ({ data = [] }) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  if (!data.length) return <Typography>{t("empty.tasks")}</Typography>;

  const totalPages = Math.ceil(data.length / ROWS_PER_PAGE);
  const rows = data.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={HeaderStyles}>{t("columns.title")}</TableCell>
            <TableCell sx={HeaderStyles}>{t("columns.priority")}</TableCell>
            <TableCell sx={{ ...HeaderStyles, pl: 5 }}>
              {t("columns.status")}
            </TableCell>
            <TableCell sx={HeaderStyles}>{t("columns.progress")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell sx={DataStyles}>{row.title}</TableCell>
              <TableCell sx={DataStyles}>{row.priority}</TableCell>
              <TableCell sx={DataStyles}>
                <CenteredCell>
                  <StatusDropdown currentStatus={row.status} />
                </CenteredCell>
              </TableCell>
              <TableCell sx={DataStyles}>{row.progress_pct}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination
        count={totalPages}
        page={page}
        onChange={(_, p) => setPage(p)}
        shape="rounded"
        size="small"
        sx={paginationSx}
      />
    </>
  );
};

/* =======================
   ATTENDANCE TAB
======================= */
const AttendanceTab = ({ data = [] }) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  if (!data.length) return <Typography>{t("empty.attendance")}</Typography>;

  const totalPages = Math.ceil(data.length / ROWS_PER_PAGE);
  const rows = data.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={HeaderStyles}>{t("columns.action")}</TableCell>
            <TableCell sx={HeaderStyles}>{t("columns.date")}</TableCell>
            <TableCell sx={HeaderStyles}>{t("columns.source")}</TableCell>
            <TableCell sx={{ ...HeaderStyles, pl: 5 }}>
              {t("columns.review_status")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell sx={DataStyles}>
                {formatEnumText(row.action_type)}
              </TableCell>
              <TableCell sx={DataStyles}>
                {formatDate(row.occurred_at)}
              </TableCell>
              <TableCell sx={DataStyles}>{row.source}</TableCell>
              <TableCell sx={DataStyles}>
                <CenteredCell>
                  <StatusDropdown currentStatus={row.review_status} />
                </CenteredCell>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination
        count={totalPages}
        page={page}
        onChange={(_, p) => setPage(p)}
        shape="rounded"
        size="small"
        sx={paginationSx}
      />
    </>
  );
};

/* =======================
   REQUESTS TAB
======================= */
const RequestsTab = ({ data = [] }) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  if (!data.length) return <Typography>{t("empty.requests")}</Typography>;

  const totalPages = Math.ceil(data.length / ROWS_PER_PAGE);
  const rows = data.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={HeaderStyles}>{t("columns.type")}</TableCell>
            <TableCell sx={{ ...HeaderStyles, pl: 5 }}>
              {t("columns.status")}
            </TableCell>
            <TableCell sx={HeaderStyles}>{t("columns.created_at")}</TableCell>
            <TableCell sx={HeaderStyles}>
              {t("columns.admin_comment")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell sx={DataStyles}>
                {formatEnumText(row.type)}
              </TableCell>
              <TableCell sx={DataStyles}>
                <CenteredCell>
                  <StatusDropdown currentStatus={row.status} />
                </CenteredCell>
              </TableCell>
              <TableCell sx={DataStyles}>
                {formatDate(row.created_at)}
              </TableCell>
              <TableCell sx={DataStyles}>
                {row.admin_comment || t("empty.not_available")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination
        count={totalPages}
        page={page}
        onChange={(_, p) => setPage(p)}
        shape="rounded"
        size="small"
        sx={paginationSx}
      />
    </>
  );
};

/* =======================
   DOCUMENTS TAB
======================= */
const DocumentsTab = ({ data = [] }) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  if (!data.length) return <Typography>{t("empty.documents")}</Typography>;

  const totalPages = Math.ceil(data.length / ROWS_PER_PAGE);
  const rows = data.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={HeaderStyles}>
              {t("columns.document_name")}
            </TableCell>
            <TableCell sx={HeaderStyles}>{t("columns.type")}</TableCell>
            <TableCell sx={HeaderStyles}>{t("columns.uploaded_at")}</TableCell>
            <TableCell sx={{ ...HeaderStyles, pl: 5 }}>
              {t("columns.status")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell sx={DataStyles}>
                {row.document_name || t("empty.not_available")}
              </TableCell>
              <TableCell sx={DataStyles}>
                {formatEnumText(row.document_type)}
              </TableCell>
              <TableCell sx={DataStyles}>
                {formatDate(row.uploaded_at)}
              </TableCell>
              <TableCell sx={DataStyles}>
                <CenteredCell>
                  <StatusDropdown currentStatus={row.status} />
                </CenteredCell>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination
        count={totalPages}
        page={page}
        onChange={(_, p) => setPage(p)}
        shape="rounded"
        size="small"
        sx={paginationSx}
      />
    </>
  );
};

/* =======================
   EXPENSES TAB
======================= */
const ExpensesTab = ({ data = [] }) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  if (!data.length) return <Typography>{t("empty.expenses")}</Typography>;

  const totalPages = Math.ceil(data.length / ROWS_PER_PAGE);
  const rows = data.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={HeaderStyles}>{t("columns.date")}</TableCell>
            <TableCell sx={HeaderStyles}>{t("columns.amount")}</TableCell>
            <TableCell sx={{ ...HeaderStyles, pl: 5 }}>
              {t("columns.status")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell sx={DataStyles}>
                {formatDate(row.date_of_expense)}
              </TableCell>
              <TableCell sx={DataStyles}>
                {row.currency} {row.amount}
              </TableCell>
              <TableCell sx={DataStyles}>
                <CenteredCell>
                  <StatusDropdown currentStatus={row.status} />
                </CenteredCell>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination
        count={totalPages}
        page={page}
        onChange={(_, p) => setPage(p)}
        shape="rounded"
        size="small"
        sx={paginationSx}
      />
    </>
  );
};

/* =======================
   REMUNERATIONS TAB
======================= */
const RemunerationsTab = ({ data = [] }) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  if (!data.length) return <Typography>{t("empty.remunerations")}</Typography>;

  const totalPages = Math.ceil(data.length / ROWS_PER_PAGE);
  const rows = data.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={HeaderStyles}>{t("columns.type")}</TableCell>
            <TableCell sx={HeaderStyles}>{t("columns.amount")}</TableCell>
            <TableCell sx={HeaderStyles}>{t("columns.paid_at")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell sx={DataStyles}>
                {formatEnumText(row.type)}
              </TableCell>
              <TableCell sx={DataStyles}>
                {row.currency} {row.amount}
              </TableCell>
              <TableCell sx={DataStyles}>
                {formatDate(row.paid_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination
        count={totalPages}
        page={page}
        onChange={(_, p) => setPage(p)}
        shape="rounded"
        size="small"
        sx={paginationSx}
      />
    </>
  );
};

/* =======================
   MAIN COMPONENT
======================= */
function WorkerDetailsTab({ workerDetails }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
console.log(t("tabs.tasks"));
  return (
    <Box mt={3} width="100%">
      <Card>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={t("tabsData.tasks")} />
          <Tab label={t("tabsData.attendance")} />
          <Tab label={t("tabsData.requests")} />
          <Tab label={t("tabsData.documents")} />
          <Tab label={t("tabsData.expenses")} />
          <Tab label={t("tabsData.remunerations")} />
        </Tabs>

        <CardContent>
          {activeTab === 0 && <TasksTab data={workerDetails?.tasks} />}
          {activeTab === 1 && (
            <AttendanceTab data={workerDetails?.attendance} />
          )}
          {activeTab === 2 && <RequestsTab data={workerDetails?.requests} />}
          {activeTab === 3 && <DocumentsTab data={workerDetails?.documents} />}
          {activeTab === 4 && <ExpensesTab data={workerDetails?.expenses} />}
          {activeTab === 5 && (
            <RemunerationsTab data={workerDetails?.remunerations} />
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default WorkerDetailsTab;
