# home plugin

Moves the legacy `ui/registry/feature_catalogue` module for registering "features" that should be shown in the home page's feature catalogue to a service within a "home" plugin. The feature catalogue refered to here should not be confused with the "feature" plugin for registering features used to derive UI capabilities for feature controls.

## Feature catalogue (public service)

Replaces the legacy `ui/registry/feature_catalogue` module for registering "features" that should be showed in the home
page's feature catalogue. This should not be confused with the "feature" plugin for registering features used to derive
UI capabilities for feature controls.

### Example registration

```ts
// For legacy plugins
import { npSetup } from 'ui/new_platform';
npSetup.plugins.home.featureCatalogue.register(/* same details here */);

// For new plugins: first add 'home` to the list of `optionalPlugins`
// in your opensearch_dashboards.json file. Then access the plugin directly in `setup`:

class MyPlugin {
  setup(core, plugins) {
    if (plugins.home) {
      plugins.home.featureCatalgoue.register(/* same details here. */);
    }
  }
}
```

Note that the old module supported providing a Angular DI function to receive Angular dependencies. This is no longer supported as we migrate away from Angular and will be removed in 8.0.

## Sample data

Replaces the sample data mixin putting functions on the global `server` object.

### What happens when a user installs a sample data set?

1. OpenSearch Dashboards deletes existing OpenSearch indicies for the sample data set if they exist from previous installs.
2. OpenSearch Dashboards creates OpenSearch indicies with the provided field mappings.
3. OpenSearch Dashboards uses bulk insert to ingest the new-line delimited json into the OpenSearch index. OpenSearch Dashboards migrates timestamps provided in new-line delimited json to the current time frame for any date field defined in `timeFields`
4. OpenSearch Dashboards will install all saved objects for sample data set. This will override any saved objects previouslly installed for sample data set.

OpenSearch index names are prefixed with `opensearch_dashboards_sample_data_`. For more details see [createIndexName](/src/plugins/home/server/services/sample_data/lib/create_index_name.js)

Sample data sets typically provide data that spans 5 weeks from the past and 5 weeks into the future so users see data relative to `now` for a few weeks after installing sample data sets.

### Adding new sample data sets

Use [existing sample data sets](/src/plugins/home/server/services/sample_data/data_sets) as examples.
To avoid bloating the OpenSearch Dashboards distribution, keep data set size to a minimum.

Follow the steps below to add new Sample data sets to OpenSearch Dashboards.

1. Create new-line delimited json containing sample data.
2. Create file with OpenSearch field mappings for sample data indices.
3. Create OpenSearch Dashboards saved objects for sample data including index-patterns, visualizations, and dashboards. The best way to extract the saved objects is from the OpenSearch Dashboards management -> saved objects [export UI](https://www.opensearch.org/guide/en/kibana/current/managing-saved-objects.html#_export)
4. Define sample data spec conforming to [Data Set Schema](/src/plugins/home/server/services/sample_data/lib/sample_dataset_registry_types.ts).
5. Register sample data by calling `plguins.home.sampleData.registerSampleDataset(yourSpecProvider)` in your `setup` method where `yourSpecProvider` is a function that returns an object containing your sample data spec from step 4.
