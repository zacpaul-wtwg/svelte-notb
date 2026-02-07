import schema from './comcash-product.schema.json' with { type: 'json' };

const defs = schema.$defs ?? {};

const toTypeList = (typeValue) => {
	if (Array.isArray(typeValue)) return typeValue;
	return typeValue ? [typeValue] : [];
};

const isTypeMatch = (value, typeName) => {
	if (typeName === 'null') return value === null;
	if (typeName === 'array') return Array.isArray(value);
	if (typeName === 'integer') return Number.isInteger(value);
	if (typeName === 'number') return typeof value === 'number' && Number.isFinite(value);
	if (typeName === 'object')
		return value !== null && typeof value === 'object' && !Array.isArray(value);
	if (typeName === 'string') return typeof value === 'string';
	if (typeName === 'boolean') return typeof value === 'boolean';
	return false;
};

const resolveRefSchema = (propertySchema) => {
	if (!propertySchema?.$ref) return propertySchema;
	const refName = propertySchema.$ref.replace('#/$defs/', '');
	return defs[refName] ?? propertySchema;
};

const isValidAgainstSchema = (value, propertySchema) => {
	const localErrors = [];
	validateValue(value, propertySchema, 'schemaCheck', localErrors);
	return localErrors.length === 0;
};

const validateValue = (value, propertySchema, path, errors) => {
	const resolved = resolveRefSchema(propertySchema);

	if (Object.prototype.hasOwnProperty.call(resolved ?? {}, 'const') && value !== resolved.const) {
		errors.push({ path, error: `Expected constant value: ${String(resolved.const)}` });
		return;
	}

	if (
		Array.isArray(resolved?.enum) &&
		!resolved.enum.some((enumValue) => Object.is(enumValue, value))
	) {
		errors.push({ path, error: `Value not in enum: ${JSON.stringify(resolved.enum)}` });
		return;
	}

	if (resolved?.anyOf) {
		const isAnyOfValid = resolved.anyOf.some((subSchema) => isValidAgainstSchema(value, subSchema));
		if (!isAnyOfValid) {
			errors.push({ path, error: 'Value does not match any allowed schema (anyOf)' });
			return;
		}
	}

	if (resolved?.allOf) {
		resolved.allOf.forEach((subSchema) => validateValue(value, subSchema, path, errors));
	}

	if (resolved?.if && resolved?.then && isValidAgainstSchema(value, resolved.if)) {
		validateValue(value, resolved.then, path, errors);
	}

	const allowedTypes = toTypeList(resolved?.type);

	if (allowedTypes.length > 0 && !allowedTypes.some((typeName) => isTypeMatch(value, typeName))) {
		errors.push({
			path,
			error: `Invalid type. Expected: ${allowedTypes.join('|')}`
		});
		return;
	}

	if (resolved?.pattern && typeof value === 'string') {
		try {
			const regex = new RegExp(resolved.pattern);
			if (!regex.test(value)) {
				errors.push({ path, error: `String does not match pattern: ${resolved.pattern}` });
				return;
			}
		} catch {
			errors.push({ path, error: `Invalid schema pattern: ${resolved.pattern}` });
			return;
		}
	}

	if (Array.isArray(value) && resolved?.items) {
		value.forEach((item, index) =>
			validateValue(item, resolved.items, `${path}[${index}]`, errors)
		);
	}

	if (value && typeof value === 'object' && !Array.isArray(value)) {
		const required = resolved?.required ?? [];
		required.forEach((key) => {
			if (!(key in value)) {
				errors.push({ path: `${path}.${key}`, error: 'Missing required property' });
			}
		});

		const properties = resolved?.properties ?? {};
		Object.keys(properties).forEach((key) => {
			if (key in value) {
				validateValue(value[key], properties[key], `${path}.${key}`, errors);
			}
		});
	}
};

export const validateComcashProductList = (productData) => {
	if (!Array.isArray(productData)) {
		return {
			valid: false,
			errors: [{ path: 'root', error: 'Expected top-level array for product list' }]
		};
	}

	const errors = [];
	productData.forEach((product, index) => {
		validateValue(product, { $ref: '#/$defs/product' }, `products[${index}]`, errors);
	});

	return {
		valid: errors.length === 0,
		errors
	};
};
