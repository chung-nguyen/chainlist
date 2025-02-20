import axios from 'axios';

const JSON_BLOB_BASE_URL = 'https://jsonblob.com/api/jsonBlob';

export type UpdateDataServiceOptions = {
  updateInterval: number;
  jsonBlobId: string;
};

class UpdateDataService {
  private _updateInterval: number;
  private _jsonBlobId: string;
  private _data: any;

  constructor() {
    this._updateInterval = 60 * 1000;
    this._jsonBlobId = '';
    this._data = {};
  }

  public getData<T>(): T {
    return this._data as T;
  }

  public async init(opts: UpdateDataServiceOptions) {
    this._updateInterval = opts.updateInterval || this._updateInterval;
    this._jsonBlobId = opts.jsonBlobId;
    await this.update();
  }

  private async update() {
    try {
      const { data } = await axios.get(`${JSON_BLOB_BASE_URL}/${this._jsonBlobId}`);
      if (data) {
        this._data = data;
      }
    } catch (ex) {
      console.error(ex);
    }

    setTimeout(() => this.update(), this._updateInterval);
  }
}

export const updateDataService = new UpdateDataService();
