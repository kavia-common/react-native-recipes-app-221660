import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  View,
  AccessibilityInfo,
} from "react-native";
import PropTypes from "prop-types";
import styles from "./styles";

/**
 * Builds a stable column list:
 * - if `columns` provided, use it
 * - else infer from first row object keys
 */
function resolveColumns({ columns, data }) {
  if (Array.isArray(columns) && columns.length > 0) return columns;

  const firstRow = Array.isArray(data) && data.length > 0 ? data[0] : null;
  if (!firstRow || typeof firstRow !== "object") return [];

  return Object.keys(firstRow).map((key) => ({
    key,
    title: key,
  }));
}

/**
 * Default accessor: data[rowIndex][columnKey]
 */
function defaultValueGetter(row, columnKey) {
  if (!row || typeof row !== "object") return "";
  const value = row[columnKey];
  // Show booleans nicely; avoid rendering objects directly.
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/**
 * Default compare: locale string compare for strings; numeric compare for numbers; fallback to string.
 */
function defaultCompare(a, b) {
  // Handle nullish values: push empty to end.
  const aNull = a === null || a === undefined || a === "";
  const bNull = b === null || b === undefined || b === "";
  if (aNull && bNull) return 0;
  if (aNull) return 1;
  if (bNull) return -1;

  const aNum = typeof a === "number" ? a : Number.NaN;
  const bNum = typeof b === "number" ? b : Number.NaN;

  const bothNumbers = !Number.isNaN(aNum) && !Number.isNaN(bNum);
  if (bothNumbers) return aNum - bNum;

  return String(a).localeCompare(String(b));
}

/**
 * Renders a single row in the table.
 */
function TableRow({
  item,
  rowIndex,
  columns,
  columnFlexes,
  rowPressable,
  onRowPress,
  rowKey,
  renderCell,
  cellTextStyle,
  getValue,
}) {
  return (
    <Pressable
      disabled={!rowPressable}
      onPress={() => onRowPress?.(item, rowIndex)}
      style={({ pressed }) => [
        styles.row,
        rowPressable && pressed ? styles.rowPressed : null,
      ]}
      accessibilityRole={rowPressable ? "button" : "none"}
      accessibilityLabel={
        rowPressable ? `Row ${rowIndex + 1}` : `Row ${rowIndex + 1}`
      }
    >
      {columns.map((col, colIndex) => {
        const cellValue = getValue(item, col.key);
        const content =
          typeof renderCell === "function"
            ? renderCell({
                row: item,
                rowIndex,
                column: col,
                columnIndex: colIndex,
                value: cellValue,
              })
            : null;

        return (
          <View
            key={col.key}
            style={[
              styles.cell,
              { flex: columnFlexes[col.key] ?? 1 },
              colIndex === 0 ? styles.firstCell : null,
              colIndex === columns.length - 1 ? styles.lastCell : null,
            ]}
          >
            {content != null ? (
              content
            ) : (
              <Text
                style={[styles.cellText, cellTextStyle]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {String(cellValue)}
              </Text>
            )}
          </View>
        );
      })}
    </Pressable>
  );
}

TableRow.propTypes = {
  item: PropTypes.oneOfType([PropTypes.object, PropTypes.any]),
  rowIndex: PropTypes.number.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      title: PropTypes.string,
      sortable: PropTypes.bool,
    })
  ).isRequired,
  columnFlexes: PropTypes.object.isRequired,
  rowPressable: PropTypes.bool.isRequired,
  onRowPress: PropTypes.func,
  rowKey: PropTypes.string,
  renderCell: PropTypes.func,
  cellTextStyle: PropTypes.object,
  getValue: PropTypes.func.isRequired,
};

export default function DynamicTable(props) {
  const {
    data,
    columns: columnsProp,
    keyExtractor,
    rowKey,
    columnFlexes,
    renderCell,
    onRowPress,
    headerStyle,
    headerTextStyle,
    rowStyle,
    cellTextStyle,
    emptyText,
    showHeader,
    sortable,
    initialSort,
    getValue,
    compareValues,
    contentContainerStyle,
    testID,
  } = props;

  const columns = useMemo(
    () => resolveColumns({ columns: columnsProp, data }),
    [columnsProp, data]
  );

  const [sortState, setSortState] = useState(() => {
    if (!initialSort) return null;
    return {
      columnKey: initialSort.columnKey,
      direction: initialSort.direction ?? "asc",
    };
  });

  const resolvedGetValue =
    typeof getValue === "function"
      ? getValue
      : (row, columnKey) => defaultValueGetter(row, columnKey);

  const resolvedCompare =
    typeof compareValues === "function" ? compareValues : defaultCompare;

  const sortedData = useMemo(() => {
    if (!sortable || !sortState?.columnKey) return data;

    const { columnKey, direction } = sortState;
    const factor = direction === "desc" ? -1 : 1;

    // Create a copy; don't mutate incoming props.
    return [...(data ?? [])].sort((ra, rb) => {
      const a = resolvedGetValue(ra, columnKey);
      const b = resolvedGetValue(rb, columnKey);
      return resolvedCompare(a, b) * factor;
    });
  }, [data, sortable, sortState, resolvedGetValue, resolvedCompare]);

  const rowPressable = typeof onRowPress === "function";

  const resolvedKeyExtractor =
    typeof keyExtractor === "function"
      ? keyExtractor
      : (item, index) => {
          // Prefer rowKey when rows are objects; else fallback to index.
          if (rowKey && item && typeof item === "object" && item[rowKey] != null) {
            return String(item[rowKey]);
          }
          return String(index);
        };

  const canShowHeader = showHeader && columns.length > 0;

  const handleHeaderPress = (column) => {
    if (!sortable) return;
    if (column.sortable === false) return;

    setSortState((prev) => {
      if (!prev || prev.columnKey !== column.key) {
        return { columnKey: column.key, direction: "asc" };
      }
      const nextDirection = prev.direction === "asc" ? "desc" : "asc";
      return { columnKey: column.key, direction: nextDirection };
    });

    // Announce sort changes for accessibility.
    AccessibilityInfo.announceForAccessibility?.(
      `Sorted by ${column.title ?? column.key}`
    );
  };

  const renderHeader = () => {
    if (!canShowHeader) return null;

    return (
      <View style={[styles.headerRow, headerStyle]}>
        {columns.map((col, idx) => {
          const isSortable = sortable && col.sortable !== false;
          const isActive = sortState?.columnKey === col.key;
          const sortIndicator =
            isActive && sortState?.direction
              ? sortState.direction === "asc"
                ? " ↑"
                : " ↓"
              : "";

          return (
            <Pressable
              key={col.key}
              onPress={() => handleHeaderPress(col)}
              disabled={!isSortable}
              style={[
                styles.headerCell,
                { flex: columnFlexes?.[col.key] ?? 1 },
                idx === 0 ? styles.firstCell : null,
                idx === columns.length - 1 ? styles.lastCell : null,
                !isSortable ? styles.headerCellNotSortable : null,
              ]}
              accessibilityRole={isSortable ? "button" : "none"}
              accessibilityLabel={
                isSortable
                  ? `Sort by ${col.title ?? col.key}`
                  : `${col.title ?? col.key}`
              }
            >
              <Text
                style={[
                  styles.headerText,
                  headerTextStyle,
                  !isSortable ? styles.headerTextNotSortable : null,
                ]}
                numberOfLines={1}
              >
                {(col.title ?? col.key) + sortIndicator}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

  const renderItem = ({ item, index }) => (
    <View style={rowStyle}>
      <TableRow
        item={item}
        rowIndex={index}
        columns={columns}
        columnFlexes={columnFlexes ?? {}}
        rowPressable={rowPressable}
        onRowPress={onRowPress}
        rowKey={rowKey}
        renderCell={renderCell}
        cellTextStyle={cellTextStyle}
        getValue={resolvedGetValue}
      />
    </View>
  );

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <View
        testID={testID}
        style={[styles.emptyContainer, contentContainerStyle]}
      >
        {renderHeader()}
        <Text style={styles.emptyText}>{emptyText}</Text>
      </View>
    );
  }

  return (
    <View testID={testID} style={[styles.container, contentContainerStyle]}>
      {renderHeader()}
      <FlatList
        data={sortedData}
        keyExtractor={resolvedKeyExtractor}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

DynamicTable.propTypes = {
  /**
   * Array of row items. Rows may be objects (typical) or any value if using custom renderCell/getValue.
   */
  data: PropTypes.arrayOf(PropTypes.any),
  /**
   * Optional columns definition. If omitted, keys are inferred from the first row object.
   * - key: field key in row object
   * - title: header label
   * - sortable: override sortable behavior per-column
   */
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      title: PropTypes.string,
      sortable: PropTypes.bool,
    })
  ),
  /**
   * Custom key extractor for FlatList rows.
   */
  keyExtractor: PropTypes.func,
  /**
   * If rows are objects, use this property as a row identifier (used when keyExtractor not provided).
   */
  rowKey: PropTypes.string,
  /**
   * Control relative widths. Example: { name: 2, calories: 1 }
   */
  columnFlexes: PropTypes.object,
  /**
   * Custom cell renderer. Return a React element to fully control the cell.
   */
  renderCell: PropTypes.func,
  /**
   * Row click handler. If provided, rows become pressable.
   */
  onRowPress: PropTypes.func,
  /**
   * Style overrides.
   */
  headerStyle: PropTypes.object,
  headerTextStyle: PropTypes.object,
  rowStyle: PropTypes.object,
  cellTextStyle: PropTypes.object,
  contentContainerStyle: PropTypes.object,
  /**
   * Empty state
   */
  emptyText: PropTypes.string,
  /**
   * Header visibility
   */
  showHeader: PropTypes.bool,
  /**
   * Sorting
   */
  sortable: PropTypes.bool,
  initialSort: PropTypes.shape({
    columnKey: PropTypes.string.isRequired,
    direction: PropTypes.oneOf(["asc", "desc"]),
  }),
  /**
   * Value getter for sorting and default rendering. If not provided, uses row[columnKey].
   */
  getValue: PropTypes.func,
  /**
   * Comparator for sorting values.
   */
  compareValues: PropTypes.func,
  /**
   * Test id
   */
  testID: PropTypes.string,
};

DynamicTable.defaultProps = {
  data: [],
  columns: undefined,
  keyExtractor: undefined,
  rowKey: "id",
  columnFlexes: undefined,
  renderCell: undefined,
  onRowPress: undefined,
  headerStyle: undefined,
  headerTextStyle: undefined,
  rowStyle: undefined,
  cellTextStyle: undefined,
  contentContainerStyle: undefined,
  emptyText: "No data",
  showHeader: true,
  sortable: false,
  initialSort: null,
  getValue: undefined,
  compareValues: undefined,
  testID: undefined,
};
