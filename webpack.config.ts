import { EnvironmentPlugin } from 'webpack';
import { config } from 'dotenv';
config();

module.exports = {
    plugins: [
        new EnvironmentPlugin([
            'API_BASE_URL',
            'FILE_BASE_URL'
        ])
    ]
}
