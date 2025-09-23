import { ReactNode } from "react";

// Table
interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: ReactNode;
}

const Table: React.FC<TableProps> = ({ children, className, ...rest }) => {
  return (
    <table className={`min-w-full ${className || ""}`} {...rest}>
      {children}
    </table>
  );
};

// TableHeader
interface TableHeaderProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  children,
  className,
  ...rest
}) => {
  return (
    <thead className={className} {...rest}>
      {children}
    </thead>
  );
};

// TableBody
interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

const TableBody: React.FC<TableBodyProps> = ({
  children,
  className,
  ...rest
}) => {
  return (
    <tbody className={className} {...rest}>
      {children}
    </tbody>
  );
};

// TableRow
interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
}

const TableRow: React.FC<TableRowProps> = ({
  children,
  className,
  ...rest
}) => {
  return (
    <tr className={className} {...rest}>
      {children}
    </tr>
  );
};

// TableCell
interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  isHeader?: boolean; // Jika true maka render <th>, jika tidak render <td>
}

const TableCell: React.FC<TableCellProps> = ({
  children,
  isHeader = false,
  className,
  ...rest
}) => {
  const CellTag = isHeader ? "th" : "td";

  return (
    <CellTag
      className={`px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 max-w-[250px] whitespace-normal break-words ${
        className || ""
      }`}
      {...rest}
    >
      {children}
    </CellTag>
  );
};

export { Table, TableHeader, TableBody, TableRow, TableCell };
