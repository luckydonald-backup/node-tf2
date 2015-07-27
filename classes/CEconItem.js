module.exports = CEconItem;

function CEconItem(soItem, tf2) {
	this._tf2 = tf2;

	this._inventory = soItem.inventory;
	this._soAttributes = soItem.attribute;

	this.id = soItem.id.toString();
	this.defindex = soItem.defIndex;
	this.quantity = soItem.quantity;
	this.level = soItem.level;
	this.quality = soItem.quality;
	this.flags = soItem.flags;
	this.origin = soItem.origin;
	this.customName = soItem.customName;
	this.customDescription = soItem.customDesc;
	this.containedItem = soItem.interiorItem ? new CEconItem(soItem.interiorItem, tf2) : null;
	this.inUse = soItem.inUse;
	this.style = soItem.style;
	// Maybe equipped state at some point
}

CEconItem.prototype.getDetails = function() {
	if(this.details) {
		return this.details;
	}

	if(!this._tf2.itemSchema || !this._tf2.itemSchema.items || !this._tf2.itemSchema.items[this.defindex]) {
		return null;
	}

	var item = this._tf2.itemSchema.items[this.defindex];

	// Apply any prefabs
	if(item.prefab && this._tf2.itemSchema.prefabs) {
		var self = this;
		item.prefab.split(' ').forEach(function(prefab) {
			self._applyPrefab(item, prefab);
		});
	}

	// Convert array-like objects into arrays
	['capabilities', 'tags', 'used_by_classes'].forEach(function(name) {
		if(item[name]) {
			item[name] = Object.keys(item[name]);
		}
	});

	// Get names from localization file if we have one
	var lang = this._tf2.lang;
	if(lang) {
		['item_name', 'item_type_name', 'item_description'].forEach(function(name) {
			if(item[name] && lang[item[name].substring(1)]) {
				item[name] = lang[item[name].substring(1)];
			}
		});
	}

	this.details = item;
	return item;
};

CEconItem.prototype._applyPrefab = function(item, prefabName) {
	var prefab = this._tf2.itemSchema.prefabs[prefabName];
	if(!prefab) {
		return;
	}

	for(var i in prefab) {
		if(!prefab.hasOwnProperty(i) || i == 'prefab' || i == 'public_prefab') {
			continue;
		}

		item[i] = prefab[i];
	}

	var self = this;
	if(prefab.prefab) {
		prefab.prefab.split(' ').forEach(function(nestedPrefab) {
			self._applyPrefab(item, nestedPrefab);
		});
	}
};

CEconItem.prototype.getBackpackPosition = function() {
	return this._inventory & 0x0000FFFF;
};