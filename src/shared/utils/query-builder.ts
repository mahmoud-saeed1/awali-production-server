import { SortOrder } from "mongoose";

type FilterQuery<T> = Record<string, unknown>;

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface QueryParams {
  page?: string;
  limit?: string;
  sort?: string;
  search?: string;
  fields?: string;
  [key: string]: string | string[] | undefined;
}

export class QueryBuilder<T> {
  private queryFilter: FilterQuery<T> = {};
  private sortOptions: Record<string, SortOrder> = {};
  private selectFields: string = "";
  private paginationOpts = { page: 1, limit: 20 };

  constructor(private params: QueryParams) {}

  filter(allowedFields: string[]): this {
    const operators: Record<string, string> = {
      gte: "$gte",
      gt: "$gt",
      lte: "$lte",
      lt: "$lt",
      in: "$in",
      ne: "$ne",
    };

    for (const [key, value] of Object.entries(this.params)) {
      if (
        !value ||
        ["page", "limit", "sort", "search", "fields"].includes(key)
      ) {
        continue;
      }

      const strValue = String(value);

      // Handle operators: field[gte]=value
      const match = key.match(/^(.+)\[(.+)\]$/);
      if (match) {
        const [, field, op] = match;
        if (field && allowedFields.includes(field) && operators[op]) {
          (this.queryFilter as Record<string, unknown>)[field] = {
            ...((this.queryFilter as Record<string, unknown>)[field] as object),
            [operators[op]]: isNaN(Number(strValue))
              ? strValue
              : Number(strValue),
          };
        }
      } else if (allowedFields.includes(key)) {
        // Handle array values: field=val1,val2
        (this.queryFilter as Record<string, unknown>)[key] = strValue.includes(
          ",",
        )
          ? { $in: strValue.split(",") }
          : strValue;
      }
    }

    return this;
  }

  search(searchFields: string[]): this {
    if (this.params.search && searchFields.length > 0) {
      const searchRegex = new RegExp(this.params.search, "i");
      (this.queryFilter as Record<string, unknown>)["$or"] = searchFields.map(
        (field) => ({
          [field]: searchRegex,
        }),
      );
    }
    return this;
  }

  textSearch(): this {
    if (this.params.search) {
      (this.queryFilter as Record<string, unknown>)["$text"] = {
        $search: this.params.search,
      };
    }
    return this;
  }

  sort(defaultSort = "-createdAt"): this {
    const sortParam = (this.params.sort as string) || defaultSort;
    for (const field of sortParam.split(",")) {
      const order: SortOrder = field.startsWith("-") ? -1 : 1;
      const fieldName = field.replace(/^-/, "");
      this.sortOptions[fieldName] = order;
    }
    return this;
  }

  select(defaultFields?: string[]): this {
    if (this.params.fields) {
      this.selectFields = this.params.fields.split(",").join(" ");
    } else if (defaultFields) {
      this.selectFields = defaultFields.join(" ");
    }
    return this;
  }

  paginate(maxLimit = 100): this {
    this.paginationOpts.page = Math.max(
      1,
      parseInt(String(this.params.page || "1"), 10),
    );
    this.paginationOpts.limit = Math.min(
      maxLimit,
      Math.max(1, parseInt(String(this.params.limit || "20"), 10)),
    );
    return this;
  }

  build() {
    return {
      filter: this.queryFilter,
      sort: this.sortOptions,
      select: this.selectFields,
      skip: (this.paginationOpts.page - 1) * this.paginationOpts.limit,
      limit: this.paginationOpts.limit,
      page: this.paginationOpts.page,
    };
  }
}
