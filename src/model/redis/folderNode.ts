import { Constants, ModelType } from "@/common/constants";
import { Util } from "@/common/util";
import * as path from "path";
import KeyNode from "./keyNode";
import RedisBaseNode from "./redisBaseNode";
import { RedisConnectionNode } from "./redisConnectionNode";
import { RedisDbNode } from "./redisDbNode";


export class RedisFolderNode extends RedisBaseNode {
    contextValue = ModelType.REDIS_FOLDER;
    readonly iconPath = path.join(Constants.RES_PATH, `image/redis_folder.svg`);
    // readonly iconPath =new ThemeIcon("folder")
    constructor(readonly label: string, private childens: string[], readonly parent: RedisBaseNode) {
        super(label)
        this.init(parent)
        this.pattern = label
        this.level = parent.hasOwnProperty('level') ? parent.level + 1 : 0
    }

    public async getChildren(isRresh?:boolean) {
        if(isRresh){
            this.cursor = '0';
            this.cursorHolder = {};
            this.childens=await RedisDbNode.prototype.getKeys.apply(this);
        }
        return RedisFolderNode.buildChilds(this, this.childens)
    }

    public async loadMore(){
        RedisConnectionNode.prototype.loadMore.apply(this);
    }

    public static buildChilds(parent: RedisBaseNode, keys: string[]):RedisBaseNode[] {
        const prefixMap: { [key: string]: string[] } = {}
        for (const key of keys.sort()) {
            let prefix = key.split(":")[parent.level];
            if (!prefixMap[prefix]) prefixMap[prefix] = []
            prefixMap[prefix].push(key)
        }

        return Object.keys(prefixMap).map((prefix: string) => {
            if (prefixMap[prefix].length > 1) {
                return new RedisFolderNode(prefix, prefixMap[prefix], parent)
            } else {
                return new KeyNode(prefixMap[prefix][0], prefix, parent)
            }
        })
    }

    public async delete() {
        Util.confirm(`Are you want delete folder ${this.label} ? `, async () => {
            const client = await this.getClient();
            for (const child of this.childens) {
                await client.del(child) 
            }
            this.provider.reload()
        })
    }

}

