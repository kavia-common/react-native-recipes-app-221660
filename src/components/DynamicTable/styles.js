import { StyleSheet } from "react-native";

const BORDER = "#E5E7EB";
const TEXT = "#111827";
const MUTED = "#6B7280";
const PRESSED = "rgba(0,0,0,0.04)";

const styles = StyleSheet.create({
  container: {
    flex: 0,
  },

  headerRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: "#F9FAFB",
  },
  headerCell: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  headerCellNotSortable: {
    opacity: 0.85,
  },
  headerText: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT,
  },
  headerTextNotSortable: {
    color: MUTED,
    fontWeight: "600",
  },

  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: "white",
  },
  rowPressed: {
    backgroundColor: PRESSED,
  },

  cell: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  cellText: {
    fontSize: 14,
    color: TEXT,
  },

  firstCell: {
    paddingLeft: 14,
  },
  lastCell: {
    paddingRight: 14,
  },

  emptyContainer: {
    borderTopWidth: 1,
    borderTopColor: BORDER,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: "white",
  },
  emptyText: {
    paddingVertical: 18,
    paddingHorizontal: 14,
    color: MUTED,
    fontSize: 14,
  },
});

export default styles;
